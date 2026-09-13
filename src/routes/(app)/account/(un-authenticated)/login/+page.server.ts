import { fail, redirect } from '@sveltejs/kit';
import invariant from 'tiny-invariant';

import { localReturnTo } from '$lib/server/navigation';
import { prisma } from '$lib/server/prisma';
import { performLogin } from '$lib/server/session';
import { check2faToken, comparePassword } from '$lib/server/utils';
import {
	numberValidator,
	presenceValidator,
	stringValidator,
	validate,
} from '$lib/server/validations';
import { themePreviewHref } from '$lib/themes/preview';
import { $_ } from '$lib/utils';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.session) {
		throw redirect(302, themePreviewHref(url, '/'));
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
				token: [numberValidator],
			},
			data,
		);

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				invalid: true,
				tokenRequired: Boolean(token),
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
		});

		if (!account || !comparePassword(password, account.password)) {
			return fail(400, { errors: { global: ['Invalid email or password'] } });
		}
		if (account.token_secret) {
			if (!token) {
				return {
					tokenRequired: true,
					email,
					password,
				};
			} else if (!(await check2faToken(token, account.id))) {
				return fail(400, {
					tokenRequired: true,
					email,
					password,
					errors: {
						token: [$_('invalid-token')],
					} as Record<string, string[]>,
				});
			}
		}

		await performLogin(cookies, account.email);
		throw redirect(302, themePreviewHref(url, returnTo));
	},
} satisfies Actions;
