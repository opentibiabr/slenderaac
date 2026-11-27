import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Decimal } from '@prisma/client/runtime/library';

import { matchesStripeOrderPrice, quoteStripePrice } from './shop-stripe-price';

void test('rounds decimal coin prices in the charge units used by Stripe', () => {
	const cases = [
		{
			currency: 'USD',
			price: '10',
			amount: 1000,
			majorAmount: 10,
			fractionDigits: 2,
		},
		{
			currency: 'BRL',
			price: '10.50',
			amount: 1050,
			majorAmount: 10.5,
			fractionDigits: 2,
		},
		{
			currency: 'EUR',
			price: '1.005',
			amount: 101,
			majorAmount: 1.01,
			fractionDigits: 2,
		},
		{
			currency: 'JPY',
			price: '500.5',
			amount: 501,
			majorAmount: 501,
			fractionDigits: 0,
		},
		{
			currency: 'MGA',
			price: '500.4',
			amount: 500,
			majorAmount: 500,
			fractionDigits: 0,
		},
		{
			currency: 'ISK',
			price: '5.5',
			amount: 600,
			majorAmount: 6,
			fractionDigits: 0,
		},
		{
			currency: 'UGX',
			price: '5',
			amount: 500,
			majorAmount: 5,
			fractionDigits: 0,
		},
		{
			currency: 'HUF',
			price: '180.45',
			amount: 18045,
			majorAmount: 180.45,
			fractionDigits: 2,
		},
		{
			currency: 'TWD',
			price: '800.45',
			amount: 80045,
			majorAmount: 800.45,
			fractionDigits: 2,
		},
	];
	for (const { currency, price, ...expected } of cases) {
		assert.deepEqual(
			quoteStripePrice({ price: new Decimal(price), currency }),
			{
				currency: currency.toLowerCase(),
				...expected,
			},
		);
	}
});

void test('rejects malformed currencies and prices that cannot produce a positive Stripe amount', () => {
	for (const price of ['-1', '0', '0.004', '90071992547409.92', 'Infinity']) {
		assert.equal(
			quoteStripePrice({ price: new Decimal(price), currency: 'USD' }),
			null,
		);
	}
	assert.equal(
		quoteStripePrice({ price: new Decimal(5), currency: 'USD ' }),
		null,
	);
	assert.equal(
		quoteStripePrice({ price: new Decimal('9999999999.99'), currency: 'IDR' })
			?.amount,
		999_999_999_999,
	);
});

void test('compares the stored quote to the amount received by a PaymentIntent', () => {
	const order = {
		currency: 'USD',
		price: new Decimal('10.50'),
		stripe_amount_minor: BigInt(1050),
	};
	const payment = {
		object: 'payment_intent' as const,
		currency: 'usd',
		amount: 1050,
		amount_received: 1000,
	};
	assert.equal(matchesStripeOrderPrice(order, payment), false);
	assert.equal(
		matchesStripeOrderPrice(order, { ...payment, amount_received: 1050 }),
		true,
	);
	assert.equal(
		matchesStripeOrderPrice(order, { ...payment, amount_received: 1100 }),
		false,
	);
	assert.equal(
		matchesStripeOrderPrice(order, {
			...payment,
			amount_received: 1050,
			currency: 'eur',
		}),
		false,
	);
});

void test('uses the Checkout integration total and currency, with a persisted-price fallback for old orders', () => {
	const order = {
		currency: 'USD',
		price: new Decimal('10.499'),
		stripe_amount_minor: null,
	};
	const session = {
		object: 'checkout.session' as const,
		currency: 'usd',
		amount_total: 1050,
		presentment_details: { amount: 1440, currency: 'cad' },
	};
	assert.equal(matchesStripeOrderPrice(order, session), true);
	assert.equal(
		matchesStripeOrderPrice(order, { ...session, currency: 'cad' }),
		false,
	);
	assert.equal(
		matchesStripeOrderPrice(order, { ...session, amount_total: null }),
		false,
	);
	assert.equal(
		matchesStripeOrderPrice(order, { ...session, amount_total: 1049.5 }),
		false,
	);
	assert.equal(
		matchesStripeOrderPrice(
			{ ...order, stripe_amount_minor: BigInt(1051) },
			session,
		),
		false,
	);
});
