import { error, fail } from '@sveltejs/kit';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import invariant from 'tiny-invariant';

import {
	checkAuthenticatorToken,
	newRecoveryCodes,
	TWO_FACTOR_SETUP_TTL_MS,
	withLockedAccount,
} from '$lib/server/account-2fa';
import { prisma } from '$lib/server/prisma';
import { requireLogin } from '$lib/server/session';
import { comparePassword } from '$lib/server/utils';
import { $_ } from '$lib/utils';

import { PUBLIC_TITLE } from '$env/static/public';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals, cookies, setHeaders }) => {
	requireLogin(locals);
	const sessionId = cookies.get('sid');
	invariant(sessionId, 'Missing session cookie');

	const setup = await withLockedAccount(
		prisma,
		locals.session.accountId,
		async (tx, account) => {
			if (!account?.is_verified) throw error(403, 'Account is not verified');
			if (account.token_secret) return null;

			const now = Date.now();
			const current = await tx.accountTwoFactorSetup.findUnique({
				where: { session_id: sessionId },
			});
			if (current && current.expires_at.getTime() > now) return current;

			const pending = {
				id: crypto.randomUUID(),
				secret: authenticator.generateSecret(),
				expires_at: new Date(now + TWO_FACTOR_SETUP_TTL_MS),
			};
			return tx.accountTwoFactorSetup.upsert({
				where: { session_id: sessionId },
				create: { session_id: sessionId, ...pending },
				update: pending,
			});
		},
	);
	if (!setup) return { enabled: true };

	setHeaders({ 'cache-control': 'private, no-store' });
	const uri = authenticator.keyuri(
		locals.session.email,
		PUBLIC_TITLE,
		setup.secret,
	);
	return { challengeId: setup.id, qrCodeURL: await toDataURL(uri) };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, locals, cookies }) => {
		requireLogin(locals);
		const accountId = locals.session.accountId;
		const sessionId = cookies.get('sid');
		invariant(sessionId, 'Missing session cookie');

		const data = await request.formData();
		const password = data.get('password');
		const challengeId = data.get('challengeId');
		const token = data.get('token');
		if (typeof password !== 'string' || !password) {
			return fail(400, {
				errors: { password: [$_('invalid-password')] } as Record<
					string,
					string[]
				>,
			});
		}
		if (typeof challengeId !== 'string' || typeof token !== 'string') {
			return fail(400, {
				errors: { token: [$_('invalid-token')] } as Record<string, string[]>,
			});
		}

		const account = await prisma.accounts.findUnique({
			where: { id: accountId },
			select: { password: true, token_secret: true, is_verified: true },
		});
		if (!account?.is_verified) throw error(403, 'Account is not verified');
		if (account.token_secret)
			return fail(409, { errors: {} as Record<string, string[]> });
		if (!comparePassword(password, account.password)) {
			return fail(400, {
				errors: { password: [$_('invalid-password')] } as Record<
					string,
					string[]
				>,
			});
		}

		const result = await withLockedAccount(
			prisma,
			accountId,
			async (tx, current) => {
				if (!current?.is_verified) return 'unverified';
				if (current.token_secret || current.password !== account.password)
					return 'changed';
				const setup = await tx.accountTwoFactorSetup.findUnique({
					where: { session_id: sessionId },
				});
				if (
					!setup ||
					setup.id !== challengeId ||
					setup.expires_at.getTime() <= Date.now() ||
					!checkAuthenticatorToken(token, setup.secret)
				) {
					return 'invalid';
				}
				const consumed = await tx.accountTwoFactorSetup.deleteMany({
					where: {
						id: setup.id,
						session_id: sessionId,
						expires_at: { gt: new Date() },
					},
				});
				if (consumed.count !== 1) return 'invalid';
				await tx.accountTwoFactorSetup.deleteMany({
					where: { session: { account_id: accountId } },
				});
				const { codes, rows } = newRecoveryCodes();
				await tx.accounts.update({
					where: { id: accountId },
					data: {
						token_secret: setup.secret,
						backupCodes: { deleteMany: {}, createMany: { data: rows } },
					},
				});
				return codes;
			},
		);
		if (result === 'unverified') throw error(403, 'Account is not verified');
		if (result === 'changed')
			return fail(409, { errors: {} as Record<string, string[]> });
		if (result === 'invalid') {
			return fail(400, {
				errors: { token: [$_('invalid-token')] } as Record<string, string[]>,
			});
		}
		return { success: true, recoveryCodes: result };
	},
} satisfies Actions;
