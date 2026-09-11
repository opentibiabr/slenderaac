import type { Handle } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { locale } from 'svelte-i18n';

import { AccountType, isAccountType } from '$lib/accounts';
import { prisma } from '$lib/server/prisma';
import { getSession, requireLogin } from '$lib/server/session';

const unauthorized = new Response(null, {
	status: 401,
	headers: {
		location: '/account/login',
	},
});

async function updateInternationalPrices() {
	try {
		console.log('Updating international prices');
		const [rates, templateOffers] = await Promise.all([
			prisma.currencyExchangeRates.findMany({
				select: { currency: true, rate: true },
			}),
			prisma.coinOffers.findMany({
				where: { currency: 'USD' },
			}),
		]);

		// Batch all upsert operations for parallel execution
		const upsertOperations = [];
		for (const { currency, rate } of rates) {
			console.log(`Updating ${currency} prices (rate: ${rate.toString()})`);
			for (const offer of templateOffers) {
				upsertOperations.push(
					prisma.coinOffers.upsert({
						where: { amount_currency: { amount: offer.amount, currency } },
						update: {
							price: offer.price.mul(rate),
						},
						create: {
							...offer,
							id: randomUUID(),
							currency: currency,
							price: offer.price.mul(rate),
						},
					}),
				);
			}
		}

		// Execute all upserts in parallel
		await Promise.all(upsertOperations);
	} catch (error) {
		console.error('Failed to update international prices', error);
	}
}

const PRICE_UPDATE_INTERVAL_MS = 12 * 60 * 60 * 1000;

console.log('Starting international price updater');
void updateInternationalPrices();

const internationalPriceUpdateInterval = setInterval(() => {
	void updateInternationalPrices();
}, PRICE_UPDATE_INTERVAL_MS);

process.on('SIGTERM', () => {
	clearInterval(internationalPriceUpdateInterval);
});

export const handle = (async ({ event, resolve }) => {
	const lang =
		event.request.headers.get('accept-language')?.split(',')[0] || 'en';
	if (lang) {
		await locale.set(lang);
	}

	const { cookies, url } = event;
	const sid = cookies.get('sid');
	if (sid) {
		const session = await getSession(sid);
		if (session) {
			event.locals.session = session;
		} else {
			cookies.delete('sid');
		}
	}

	if (url.pathname.startsWith('/admin')) {
		requireLogin(event.locals, 'admin');

		const account = await prisma.accounts.findUnique({
			where: { id: event.locals.session?.accountId },
			select: { type: true },
		});
		if (!account || !isAccountType(account.type)) {
			return unauthorized;
		}
		if (!event.locals.session?.accountId || account.type !== AccountType.God) {
			return unauthorized;
		}
	}

	const response = await resolve(event);
	return response;
}) satisfies Handle;
