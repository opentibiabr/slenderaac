import type { CoinOffers, CoinOrders } from '@prisma/client';
import type Stripe from 'stripe';

// Stripe's charge denominations differ from ISO display and payout rules.
const zeroDecimalCurrencies = new Set([
	'bif',
	'clp',
	'djf',
	'gnf',
	'jpy',
	'kmf',
	'krw',
	'mga',
	'pyg',
	'rwf',
	'vnd',
	'vuv',
	'xaf',
	'xof',
	'xpf',
]);
const wholeCurrenciesSentAsCents = new Set(['isk', 'ugx']);

export function quoteStripePrice(
	offer: Pick<CoinOffers, 'price' | 'currency'>,
) {
	const currency = offer.currency.toLowerCase();
	if (!/^[a-z]{3}$/.test(currency) || !offer.price.isPositive()) return null;

	const wholeCurrencySentAsCents = wholeCurrenciesSentAsCents.has(currency);
	const fractionDigits =
		wholeCurrencySentAsCents || zeroDecimalCurrencies.has(currency) ? 0 : 2;
	const rounded = offer.price.toFixed(fractionDigits, 4); // Decimal ROUND_HALF_UP
	const amount = Number(
		rounded.replace('.', '') + (wholeCurrencySentAsCents ? '00' : ''),
	);
	if (!Number.isSafeInteger(amount) || amount < 1) return null;

	return { amount, currency, fractionDigits, majorAmount: Number(rounded) };
}

type StripePayment =
	| Pick<Stripe.PaymentIntent, 'object' | 'currency' | 'amount_received'>
	| Pick<Stripe.Checkout.Session, 'object' | 'currency' | 'amount_total'>;

export function matchesStripeOrderPrice(
	order: Pick<CoinOrders, 'price' | 'currency' | 'stripe_amount_minor'>,
	payment: StripePayment,
) {
	// Checkout totals use the integration currency even with Adaptive Pricing.
	const amount =
		payment.object === 'payment_intent'
			? payment.amount_received
			: payment.amount_total;
	if (
		payment.currency !== order.currency.toLowerCase() ||
		amount === null ||
		!Number.isSafeInteger(amount) ||
		amount < 1
	) {
		return false;
	}

	if (order.stripe_amount_minor !== null) {
		return BigInt(amount) === order.stripe_amount_minor;
	}

	// Old orders have the original price but no minor-unit snapshot.
	return amount === quoteStripePrice(order)?.amount;
}
