import { fail, redirect } from '@sveltejs/kit';
import invariant from 'tiny-invariant';

import {
	verifyAccountFactor,
	withLockedAccount,
} from '$lib/server/account-2fa';
import { localReturnTo } from '$lib/server/navigation';
import { prisma } from '$lib/server/prisma';
import { createWebSession, setWebSessionCookie } from '$lib/server/session';
import {
	comparePassword,
	migrateAuthenticatedPassword,
} from '$lib/server/utils';
import {
	presenceValidator,
	stringValidator,
	validate,
} from '$lib/server/validations';
import { $_ } from '$lib/utils';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.session) {
		throw redirect(302, '/');
	}

	return {
		title: 'Login',
	};
};

export const actions: Actions = {
	default: async ({ url, cookies, request }) => {
		const data = await request.formData();
		let email = data.get('email');
		const password = data.get('password');
		const token = data.get('token');
		const returnTo = localReturnTo(url.searchParams.get('returnTo'), url);

		const errors = await validate(
			{
				email: [presenceValidator, stringValidator],
				password: [presenceValidator, stringValidator],
				token: [stringValidator],
			},
			data,
		);

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				invalid: true,
				tokenRequired: Boolean(token) && typeof email === 'string',
				email: typeof email === 'string' ? email : undefined,
				errors: errors,
			});
		}

		invariant(email && password, 'Missing required fields');
		invariant(typeof email === 'string', 'Email must be a string');
		invariant(!token || typeof token === 'string', 'Token must be a string');
		invariant(typeof password === 'string', 'Passsword must be a string');
		email = email.toLowerCase();

		const account = await prisma.accounts.findUnique({
			where: { email },
			select: { id: true, email: true, password: true, token_secret: true },
		});

		if (!account || !comparePassword(password, account.password)) {
			return fail(400, { errors: { global: ['Invalid email or password'] } });
		}
		if (account.token_secret && !token) {
			return { tokenRequired: true, email };
		}

		const result = await withLockedAccount(
			prisma,
			account.id,
			async (client, current) => {
				if (
					!current ||
					current.email !== account.email ||
					(current.password !== account.password &&
						!comparePassword(password, current.password)) ||
					current.token_secret !== account.token_secret
				) {
					return { type: 'credentials-changed' } as const;
				}
				if (
					current.token_secret &&
					(!token || !(await verifyAccountFactor(client, current, token)))
				) {
					return { type: 'invalid-token' } as const;
				}
				return {
					type: 'session',
					account: current,
					sid: await createWebSession(client, current),
				} as const;
			},
		);
		if (result.type === 'credentials-changed') {
			return fail(400, { errors: { global: ['Invalid email or password'] } });
		}
		if (result.type === 'invalid-token') {
			return fail(400, {
				tokenRequired: true,
				email,
				errors: { token: [$_('invalid-token')] } as Record<string, string[]>,
			});
		}

		setWebSessionCookie(cookies, result.sid);
		await migrateAuthenticatedPassword(result.account, password);
		throw redirect(302, returnTo);
	},
} satisfies Actions;
