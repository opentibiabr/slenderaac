import type { Handle } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { locale } from 'svelte-i18n';

import { AccountType, isAccountType } from '$lib/accounts';
import { themeSwitcherEnabled } from '$lib/server/config';
import { checkDatabaseConfiguration } from '$lib/server/database-config';
import { diagnosticsEnabled, diagnosticStep } from '$lib/server/diagnostics';
import { errorCode, log, startLogOperation } from '$lib/server/logging';
import { prisma } from '$lib/server/prisma';
import {
	clearWebSessionCookie,
	getSession,
	requireLogin,
	WEB_SESSION_COOKIE,
} from '$lib/server/session';
import { preserveLayoutSelectionRedirect } from '$lib/server/theme-assets/selection-redirect';

const unauthorized = new Response(null, {
	status: 401,
	headers: {
		location: '/account/login',
	},
});

async function updateInternationalPrices() {
	const finish = startLogOperation('prices');
	try {
		const [rates, templateOffers] = await Promise.all([
			prisma.currencyExchangeRates.findMany({
				select: { currency: true, rate: true },
			}),
			prisma.coinOffers.findMany({
				where: { currency: 'USD' },
			}),
		]);

		const upsertOperations = [];
		for (const { currency, rate } of rates) {
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
							currency,
							price: offer.price.mul(rate),
						},
					}),
				);
			}
		}

		await Promise.all(upsertOperations);
		finish(
			`completed currencies=${rates.length} offers=${templateOffers.length}`,
		);
	} catch (error) {
		finish(`failed code=${errorCode(error)}`, 'error');
	}
}

const PRICE_UPDATE_INTERVAL_MS = 12 * 60 * 60 * 1000;

log(
	'info',
	'startup',
	`SlenderAAC server hooks loaded; runtime=${process.version} pid=${process.pid} diagnostics=${diagnosticsEnabled}`,
);
let internationalPriceUpdateInFlight: Promise<void> | null = null;

function scheduleInternationalPriceUpdate() {
	if (internationalPriceUpdateInFlight) return;

	internationalPriceUpdateInFlight = updateInternationalPrices().finally(() => {
		internationalPriceUpdateInFlight = null;
	});
}

scheduleInternationalPriceUpdate();

setInterval(() => {
	scheduleInternationalPriceUpdate();
}, PRICE_UPDATE_INTERVAL_MS);

void checkDatabaseConfiguration(diagnosticsEnabled);

export const handle = (async ({ event, resolve }) => {
	const lang =
		event.request.headers.get('accept-language')?.split(',')[0] || 'en';
	if (lang) {
		await diagnosticStep('request.locale', () => locale.set(lang));
	}

	const { cookies, url } = event;
	const sid =
		event.route.id === '/api/login'
			? undefined
			: cookies.get(WEB_SESSION_COOKIE);
	if (sid) {
		const session = await diagnosticStep('request.session', () =>
			getSession(sid),
		);
		if (session) {
			event.locals.session = session;
		} else {
			clearWebSessionCookie(cookies);
		}
	}

	const routeId = event.route.id;
	if (routeId === '/admin' || routeId?.startsWith('/admin/')) {
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

	const response = await diagnosticStep(
		`request.resolve ${event.route.id ?? '(unmatched)'}`,
		() => resolve(event),
	);
	return themeSwitcherEnabled && event.route.id?.startsWith('/(app)')
		? preserveLayoutSelectionRedirect(
				response,
				url,
				event.isDataRequest ||
					event.request.headers.get('x-sveltekit-action') === 'true',
			)
		: response;
}) satisfies Handle;
