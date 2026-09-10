import {
	type CoinOffers,
	type CoinOrders,
	CoinOrderStatus,
} from '@prisma/client';
import { error, redirect } from '@sveltejs/kit';
import invariant from 'tiny-invariant';

import type { CoinOffer } from '$lib/coinOffers';
import { isStep, stepIsAtOrAfter } from '$lib/payments';
import { enableStripeCheckout, enableStripeCustom } from '$lib/server/config';
import { prisma } from '$lib/server/prisma';
import { requireLogin } from '$lib/server/session';
import { stripe } from '$lib/server/stripe';
import { serverName } from '$lib/server/worlds';
import { themePreviewHref, themePreviewLoginHref } from '$lib/themes/preview';
import { formatCurrency, groupBy } from '$lib/utils';

import { PUBLIC_BASE_URL, PUBLIC_TITLE } from '$env/static/public';

import type { Actions, PageServerLoad } from '../$types';

const enabledPaymentMethods = [
	stripe && enableStripeCustom ? 'stripe' : null,
	stripe && enableStripeCheckout ? 'stripe-checkout' : null,
].filter(Boolean) as string[];

export const load = (async ({ locals, url, depends }) => {
	depends('shop:order');

	requireLogin(locals, '', themePreviewLoginHref(url));

	const offers = groupBy(
		(await prisma.coinOffers.findMany({ orderBy: { amount: 'asc' } })).map(
			(offer): CoinOffer => ({
				id: offer.id,
				currency: offer.currency,
				amount: offer.amount,
				price: formatCurrency(offer.price.toNumber(), offer.currency),
			}),
		),
		'currency',
	);

	let step = url.searchParams.get('step') || 'selection';
	if (!isStep(step)) {
		step = 'selection';
	}
	invariant(isStep(step), 'Invalid step');

	const token =
		url.searchParams.get('token') || url.searchParams.get('payment_intent');
	const clientSecret =
		url.searchParams.get('clientSecret') ||
		url.searchParams.get('payment_intent_client_secret');
	const paymentMethod = url.searchParams.get('paymentMethod');
	if (
		stepIsAtOrAfter(step, 'payment') &&
		(!token || typeof token !== 'string')
	) {
		throw error(422, { message: 'Invalid payment id' });
	}

	const offerId = url.searchParams.get('offerId');
	if (step === 'payment') {
		if (!offerId || typeof offerId !== 'string') {
			throw error(422, { message: 'Invalid offer ID' });
		}
		if (!paymentMethod || typeof paymentMethod !== 'string') {
			throw error(422, { message: 'Invalid payment method' });
		}
	}

	let order: CoinOrders | null = null;
	if (step === 'confirmation') {
		invariant(token, 'No payment token found');
		order = await prisma.coinOrders.findUniqueOrThrow({
			where: { payment_token: token },
		});
	} else if (token) {
		order = await prisma.coinOrders.findUniqueOrThrow({
			where: { payment_token: token },
		});
		if (
			order.status !== CoinOrderStatus.PENDING &&
			order.status !== CoinOrderStatus.FAILED_ATTEMPT
		) {
			throw redirect(302, themePreviewHref(url, '/shop/coins'));
		}
	}

	return {
		step,
		offers,
		enabledPaymentMethods,
		accountEmail: locals.session?.email,
		offerId,
		token,
		clientSecret,
		paymentMethod,
		order: order
			? {
					status: order.status,
					amount: order.amount,
				}
			: null,
	};
}) satisfies PageServerLoad;

export const actions = {
	createIntent: async ({ locals, request, url }) => {
		requireLogin(locals, '', themePreviewLoginHref(url));
		invariant(locals.session, 'No session found in locals');

		const data = await request.formData();
		const offerId = data.get('offerId');
		const paymentMethod = data.get('paymentMethod');
		if (!offerId || typeof offerId !== 'string') {
			throw error(422, { message: 'Invalid offer ID' });
		}

		if (!paymentMethod || typeof paymentMethod !== 'string') {
			throw error(422, { message: 'Invalid payment method' });
		}

		if (!enabledPaymentMethods.includes(paymentMethod)) {
			throw error(422, { message: 'Invalid payment method' });
		}

		let clientSecret: string | null = null;
		let token: string | null;
		let redirectURL: string | null = null;

		const offer = await prisma.coinOffers.findUniqueOrThrow({
			where: { id: offerId },
		});

		switch (paymentMethod) {
			case 'stripe':
				({ token, clientSecret } = await handleStripe(
					locals.session.email,
					offer,
				));
				break;
			case 'stripe-checkout':
				({ token, redirectURL } = await handleStripeCheckout(
					locals.session.email,
					offer,
					url,
				));
				break;
			default:
				throw error(422, { message: 'Invalid payment method' });
		}

		invariant(token, 'No payment token found');

		await prisma.coinOrders.create({
			data: {
				account: { connect: { id: locals.session?.accountId } },
				price: offer.price,
				currency: offer.currency,
				amount: offer.amount,
				status: CoinOrderStatus.PENDING,
				payment_token: token,
			},
		});

		if (redirectURL) {
			throw redirect(303, redirectURL);
		}

		const paymentUrl = new URL(themePreviewHref(url, '/shop/coins/'), url);
		paymentUrl.searchParams.set('step', 'payment');
		paymentUrl.searchParams.set('paymentMethod', paymentMethod);
		paymentUrl.searchParams.set('token', token);
		paymentUrl.searchParams.set('offerId', offerId);
		if (clientSecret) {
			paymentUrl.searchParams.set('clientSecret', clientSecret);
		}
		throw redirect(302, `${paymentUrl.pathname}${paymentUrl.search}`);
	},
} satisfies Actions;

async function handleStripe(accountEmail: string, offer: CoinOffers) {
	invariant(stripe, 'Stripe not enabled');

	const paymentIntent = await stripe.paymentIntents.create({
		amount: Number(offer.price.toString().replace('.', '')),
		currency: offer.currency.toLowerCase(),
		receipt_email: accountEmail,
		description: `Purchase of ${offer.amount} ${await serverName()} Coins`,
		statement_descriptor_suffix: `${PUBLIC_TITLE} Coins`,
		automatic_payment_methods: {
			enabled: true,
		},
	});

	return { token: paymentIntent.id, clientSecret: paymentIntent.client_secret };
}

async function handleStripeCheckout(
	accountEmail: string,
	offer: CoinOffers,
	currentUrl: URL,
) {
	invariant(stripe, 'Stripe not enabled');
	const returnPath = themePreviewHref(
		currentUrl,
		'/shop/coins/?step=confirmation',
	);
	const redirectURL = new URL(returnPath, PUBLIC_BASE_URL).href;
	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price_data: {
					currency: offer.currency.toLowerCase(),
					product_data: {
						name: `${offer.amount} ${await serverName()} Coins`,
					},
					unit_amount: Number(offer.price.toFixed(2).replace('.', '')),
				},
				quantity: 1,
			},
		],
		mode: 'payment',
		customer_email: accountEmail,
		success_url: redirectURL + '&token={CHECKOUT_SESSION_ID}',
		cancel_url: redirectURL + '&token={CHECKOUT_SESSION_ID}',
	});

	return { token: session.id, redirectURL: session.url };
}
