import type { Prisma } from '@prisma/client';
import { type Cookies, fail, redirect } from '@sveltejs/kit';
import { authenticator } from 'otplib';

import {
	clearWebSessionCookie,
	lockActiveWebSession,
	lockWebSessionAccount,
	WEB_SESSION_COOKIE,
} from '$lib/server/session';
import { comparePassword } from '$lib/server/utils';
import { $_ } from '$lib/utils';

const maxFailures = 5;
const windowMs = 5 * 60_000;

type ReauthenticationFailure =
	| { status: 'session-ended' | 'rate-limited' }
	| { status: 'invalid-password'; tokenRequired: boolean }
	| { status: 'invalid-token' };

export async function reauthenticateCredentialChange(
	client: Prisma.TransactionClient,
	accountId: number,
	cookies: Cookies,
	password: string,
	token: FormDataEntryValue | null,
) {
	// Serialize with web login and other credential changes for this account.
	await lockWebSessionAccount(client, accountId);
	if (
		!(await lockActiveWebSession(
			client,
			accountId,
			cookies.get(WEB_SESSION_COOKIE),
		))
	) {
		return { status: 'session-ended' } as const;
	}

	const account = await client.accounts.findUniqueOrThrow({
		where: { id: accountId },
		select: { password: true, token_secret: true },
	});
	const where = { account_id: accountId };
	const now = BigInt(Date.now());
	const previous = await client.webCredentialChangeAttempt.findUnique({
		where,
	});
	const active = previous && previous.window_until > now ? previous : null;
	if (active && active.failures >= maxFailures) {
		return { status: 'rate-limited' } as const;
	}

	const passwordValid = comparePassword(password, account.password);
	const tokenRequired = Boolean(account.token_secret);
	if (passwordValid && tokenRequired && (token === null || token === '')) {
		return { status: 'invalid-token' } as const;
	}
	const tokenValid =
		!account.token_secret ||
		(typeof token === 'string' &&
			token.length === 6 &&
			/^\d{6}$/.test(token) &&
			authenticator.check(token, account.token_secret));

	if (!passwordValid || !tokenValid) {
		const failure = {
			failures: (active?.failures ?? 0) + 1,
			window_until: active?.window_until ?? now + BigInt(windowMs),
		};
		await client.webCredentialChangeAttempt.upsert({
			where,
			create: { account_id: accountId, ...failure },
			update: failure,
		});
		return passwordValid
			? ({ status: 'invalid-token' } as const)
			: ({ status: 'invalid-password', tokenRequired } as const);
	}

	if (previous) await client.webCredentialChangeAttempt.delete({ where });
	return { status: 'authenticated', account } as const;
}

export function credentialChangeRejected(
	cookies: Cookies,
	result: ReauthenticationFailure,
	passwordField: string,
) {
	if (result.status === 'session-ended') {
		clearWebSessionCookie(cookies);
		throw redirect(303, '/account/login');
	}
	const errors: Record<string, string[]> = {};
	if (result.status === 'rate-limited') {
		errors.global = ['Too many attempts. Please try again later.'];
		return fail(429, { errors });
	}
	if (result.status === 'invalid-password') {
		errors[passwordField] = [$_('invalid-password')];
		return fail(400, { errors, tokenRequired: result.tokenRequired });
	}
	errors.token = [$_('invalid-token')];
	return fail(400, { errors, tokenRequired: true });
}
