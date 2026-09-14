import type { Handle } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { locale } from 'svelte-i18n';

import { AccountType, isAccountType } from '$lib/accounts';
import { themeSwitcherEnabled } from '$lib/server/config';
import { checkDatabaseConfiguration } from '$lib/server/database-config';
import { diagnosticsEnabled, diagnosticStep } from '$lib/server/diagnostics';
import { errorCode, log, startLogOperation } from '$lib/server/logging';
import { prisma } from '$lib/server/prisma';
import { getSession, requireLogin } from '$lib/server/session';
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
		const rates = await prisma.currencyExchangeRates.findMany({
			select: { currency: true, rate: true },
		});
		for (const { currency, rate } of rates) {
			const templateOffers = await prisma.coinOffers.findMany({
				where: { currency: 'USD' },
			});
			for (const offer of templateOffers) {
				await prisma.coinOffers.upsert({
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
				});
			}
		}
		finish(`completed currencies=${rates.length}`);
	} catch (error) {
		finish(`failed code=${errorCode(error)}`, 'error');
	}
}

log(
	'info',
	'startup',
	`SlenderAAC server hooks loaded; runtime=${process.version} pid=${process.pid} diagnostics=${diagnosticsEnabled}`,
);
void updateInternationalPrices();

void checkDatabaseConfiguration(diagnosticsEnabled);

export const handle = (async ({ event, resolve }) => {
	const lang =
		event.request.headers.get('accept-language')?.split(',')[0] || 'en';
	if (lang) {
		await diagnosticStep('request.locale', () => locale.set(lang));
	}

	const { cookies, url } = event;
	const sid = cookies.get('sid');
	if (sid) {
		const session = await diagnosticStep('request.session', () =>
			getSession(sid),
		);
		if (session) {
			event.locals.session = session;
		} else {
			cookies.delete('sid', { path: '/' });
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
