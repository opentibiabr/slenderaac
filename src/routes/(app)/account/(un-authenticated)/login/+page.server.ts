import { fail, redirect } from '@sveltejs/kit';
import invariant from 'tiny-invariant';

import {
	verifyAccountFactor,
	withLockedAccount,
} from '$lib/server/account-2fa';
import { allowLoginAttempt } from '$lib/server/login-attempts';
import { localReturnTo } from '$lib/server/navigation';
import { prisma } from '$lib/server/prisma';
import { createSessionForAccount, setLoginCookie } from '$lib/server/session';
import { comparePassword } from '$lib/server/utils';
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

const tryAgainLater = 'Too many login attempts. Try again later.';

export const actions: Actions = {
	default: async ({ url, cookies, request, getClientAddress }) => {
		if (!(await allowLoginAttempt('source', getClientAddress))) {
			return fail(429, { errors: { global: [tryAgainLater] } });
		}

		const data = await request.formData();
		let email = data.get('email');
		const password = data.get('password');
		const token = data.get('token');
		const returnTo = localReturnTo(url.searchParams.get('returnTo'), url);

		const errors = await validate(
			{
				email: [presenceValidator, stringValidator],
				password: [presenceValidator, stringValidator],
			},
			data,
		);

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				invalid: true,
				errors: errors,
			});
		}

		invariant(email && password, 'Missing required fields');
		invariant(typeof email === 'string', 'Email must be a string');
		invariant(typeof password === 'string', 'Passsword must be a string');
		email = email.toLowerCase();

		const account = await prisma.accounts.findUnique({
			where: { email },
		});

		if (
			!account ||
			!(await allowLoginAttempt('password', account.id)) ||
			!comparePassword(password, account.password)
		) {
			return fail(400, { errors: { global: ['Invalid email or password'] } });
		}
		const result = await withLockedAccount(
			prisma,
			account.id,
			async (tx, current) => {
				if (
					!current ||
					current.password !== account.password ||
					current.email !== account.email
				) {
					return { kind: 'credentials' } as const;
				}
				if (current.token_secret) {
					if (!token) return { kind: 'challenge' } as const;
					if (!(await allowLoginAttempt('factor', current.id, tx))) {
						return { kind: 'limited' } as const;
					}
					if (
						typeof token !== 'string' ||
						!(await verifyAccountFactor(tx, current, token))
					) {
						return { kind: 'factor' } as const;
					}
				}
				const sid = await createSessionForAccount(tx, current);
				return { kind: 'session', sid } as const;
			},
		);
		if (result.kind === 'credentials') {
			return fail(400, { errors: { global: ['Invalid email or password'] } });
		}
		if (result.kind === 'challenge')
			return { tokenRequired: true, email, password };
		if (result.kind === 'factor' || result.kind === 'limited') {
			const limited = result.kind === 'limited';
			return fail(limited ? 429 : 400, {
				tokenRequired: true,
				email,
				password,
				errors: {
					token: [limited ? tryAgainLater : $_('invalid-token')],
				} as Record<string, string[]>,
			});
		}

		setLoginCookie(cookies, result.sid);
		throw redirect(302, returnTo);
	},
} satisfies Actions;
