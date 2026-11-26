import { fail, redirect } from '@sveltejs/kit';
import invariant from 'tiny-invariant';

import {
	verifyAccountFactor,
	withLockedAccount,
} from '$lib/server/account-2fa';
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

		if (!account || !comparePassword(password, account.password)) {
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
		if (result.kind === 'factor') {
			return fail(400, {
				tokenRequired: true,
				email,
				password,
				errors: { token: [$_('invalid-token')] } as Record<string, string[]>,
			});
		}

		setLoginCookie(cookies, result.sid);
		throw redirect(302, returnTo);
	},
} satisfies Actions;
