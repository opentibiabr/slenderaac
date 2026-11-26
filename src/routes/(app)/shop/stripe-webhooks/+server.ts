/// <reference types="stripe-event-types" />

import type Stripe from 'stripe';
import { CoinOrderStatus } from '@prisma/client';
import { error } from 'console';
import invariant from 'tiny-invariant';

import { CoinTransactionType } from '$lib/coinTransactions';
import { prisma } from '$lib/server/prisma';
import { matchesStripeOrderPrice } from '$lib/server/shop-stripe-price';
import { stripe } from '$lib/server/stripe';

import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	invariant(stripe, 'Stripe not enabled');
	const signatureHeader = request.headers.get('stripe-signature');
	if (!signatureHeader) {
		throw error(400, { message: 'Missing signature header' });
	}

	const event = stripe.webhooks.constructEvent(
		await request.text(),
		signatureHeader,
		STRIPE_WEBHOOK_SECRET,
	) as Stripe.DiscriminatedEvent;

	switch (event.type) {
		case 'payment_intent.processing':
			await prisma.coinOrders.update({
				where: { payment_token: event.data.object.id },
				data: { status: CoinOrderStatus.PENDING },
			});
			break;
		case 'payment_intent.canceled':
			await prisma.coinOrders.update({
				where: { payment_token: event.data.object.id },
				data: { status: CoinOrderStatus.CANCELED },
			});
			break;
		case 'payment_intent.payment_failed':
		case 'checkout.session.async_payment_failed':
		case 'checkout.session.expired':
			await prisma.coinOrders.update({
				where: { payment_token: event.data.object.id },
				data: { status: CoinOrderStatus.FAILED_ATTEMPT },
			});
			break;
		case 'payment_intent.succeeded':
		case 'checkout.session.completed':
		case 'checkout.session.async_payment_succeeded':
			await handlePaymentSuccess(event);
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

	await prisma.$transaction([
		prisma.coinOrders.update({
			where: { id: order.id },
			data: {
				status: CoinOrderStatus.COMPLETED,
			},
		}),
		prisma.coinsTransactions.create({
			data: {
				account: { connect: { id: order.account_id } },
				description: `Purchase of ${order.amount} coins`,
				amount: order.amount,
				type: CoinTransactionType.CoinAdd,
			},
		}),
		prisma.accounts.update({
			where: { id: order.account_id },
			data: { coins_transferable: { increment: order.amount } },
		}),
	]);
}
