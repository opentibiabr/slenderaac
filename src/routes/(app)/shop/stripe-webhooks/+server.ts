/// <reference types="stripe-event-types" />

import type Stripe from 'stripe';
import { error } from '@sveltejs/kit';
import invariant from 'tiny-invariant';

import { prisma } from '$lib/server/prisma';
import { matchesStripeOrderPrice } from '$lib/server/shop-stripe-price';
import { stripe } from '$lib/server/stripe';
import {
	fulfillStripeCoinOrder,
	updateStripeCoinOrderStatus,
} from '$lib/server/stripe-coin-fulfillment';

import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	invariant(stripe, 'Stripe not enabled');
	const signatureHeader = request.headers.get('stripe-signature');
	if (!signatureHeader) {
		throw error(400, { message: 'Missing signature header' });
	}

	let event: Stripe.DiscriminatedEvent;
	try {
		event = stripe.webhooks.constructEvent(
			await request.text(),
			signatureHeader,
			STRIPE_WEBHOOK_SECRET,
		) as Stripe.DiscriminatedEvent;
	} catch {
		throw error(400, { message: 'Invalid Stripe webhook' });
	}

	switch (event.type) {
		case 'payment_intent.processing':
			await updateStripeCoinOrderStatus(
				prisma,
				event.data.object.id,
				'PENDING',
			);
			break;
		case 'payment_intent.canceled':
		case 'checkout.session.expired':
			await updateStripeCoinOrderStatus(
				prisma,
				event.data.object.id,
				'CANCELED',
			);
			break;
		case 'payment_intent.payment_failed':
		case 'checkout.session.async_payment_failed':
			await updateStripeCoinOrderStatus(
				prisma,
				event.data.object.id,
				'FAILED_ATTEMPT',
			);
			break;
		case 'payment_intent.succeeded':
			if (event.data.object.status === 'succeeded') {
				await handlePaymentSuccess(event);
			}
			break;
		case 'checkout.session.completed':
		case 'checkout.session.async_payment_succeeded':
			if (event.data.object.payment_status === 'paid') {
				await handlePaymentSuccess(event);
			}
			break;
	}

	return new Response();
};

async function handlePaymentSuccess(
	event:
		| Stripe.DiscriminatedEvent.PaymentIntentEvent
		| Stripe.DiscriminatedEvent.CheckoutSessionEvent,
) {
	const order = await prisma.coinOrders.findUnique({
		where: { payment_token: event.data.object.id },
	});

	if (order && !matchesStripeOrderPrice(order, event.data.object)) {
		console.warn('Stripe coin order amount or currency mismatch', order.id);
		return;
	}

	if (!order) {
		console.error('Order not found', event.data.object.id);
		return;
	}

	if (order.status === 'COMPLETED' || order.status === 'CANCELED') return;
	if (!order.stripe_fulfillment_enabled) {
		console.warn('Stripe coin order requires reconciliation', order.id);
		return;
	}

	await fulfillStripeCoinOrder(prisma, order);
}
