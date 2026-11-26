import { fail } from '@sveltejs/kit';

import {
	verifyAccountFactor,
	withLockedAccount,
} from '$lib/server/account-2fa';
import { prisma } from '$lib/server/prisma';
import { requireLogin } from '$lib/server/session';
import { comparePassword } from '$lib/server/utils';
import { $_ } from '$lib/utils';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	requireLogin(locals);
	const account = await prisma.accounts.findUniqueOrThrow({
		where: { id: locals.session.accountId },
		select: { token_secret: true },
	});
	return { enabled: Boolean(account.token_secret) };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, locals }) => {
		requireLogin(locals);
		const accountId = locals.session.accountId;
		const data = await request.formData();
		const password = data.get('password');
		const token = data.get('token');

		if (typeof password !== 'string' || !password) {
			return fail(400, { errors: { password: [$_('invalid-password')] } });
		}
		if (typeof token !== 'string' || !token) {
			return fail(400, { errors: { token: [$_('invalid-token')] } });
		}
		const account = await prisma.accounts.findUnique({
			where: { id: accountId },
			select: { password: true, token_secret: true },
		});
		if (!account || !comparePassword(password, account.password)) {
			return fail(400, { errors: { password: [$_('invalid-password')] } });
		}
		if (!account.token_secret) {
			return fail(400, { errors: { token: [$_('2fa-not-enabled')] } });
		}

		const disabled = await withLockedAccount(
			prisma,
			accountId,
			async (tx, current) => {
				if (
					!current ||
					current.password !== account.password ||
					current.token_secret !== account.token_secret ||
					!(await verifyAccountFactor(tx, current, token))
				) {
					return false;
				}
				await tx.accounts.update({
					where: { id: accountId },
					data: { token_secret: null, backupCodes: { deleteMany: {} } },
				});
				return true;
			},
		);
		if (!disabled)
			return fail(400, { errors: { token: [$_('invalid-token')] } });
		return { success: true };
	},
} satisfies Actions;
