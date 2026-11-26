import { error, fail } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';
import { redirect } from 'sveltekit-flash-message/server';
import invariant from 'tiny-invariant';

import { prisma } from '$lib/server/prisma';
import { hashPassword } from '$lib/server/utils';
import {
	emailValidator,
	presenceValidator,
	stringValidator,
	validate,
} from '$lib/server/validations';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const email = url.searchParams.get('email');
	const token = url.searchParams.get('token');
	if (!email || !token) {
		throw error(422, 'Invalid email or token');
	}

	const reset = await prisma.passwordReset.findUnique({
		where: { token },
		include: { account: true },
	});
	if (!reset || !reset.account) {
		throw error(422, 'Invalid email or token');
	}
	if (reset.expires <= new Date()) {
		throw error(422, 'Token expired');
	}
	if (reset.account.email !== email) {
		throw error(422, 'Invalid email or token');
	}
	return {
		token,
		email,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const { request } = event;

		const data = await request.formData();
		const email = data.get('email');
		const token = data.get('token');
		const password = data.get('password');
		const passwordConfirmation = data.get('passwordConfirmation');

		const errors = await validate(
			{
				token: [presenceValidator, stringValidator],
				email: [presenceValidator, emailValidator],
				password: [presenceValidator, stringValidator],
				passwordConfirmation: [
					presenceValidator,
					stringValidator,
					(value) => {
						if (value !== password) {
							return 'Passwords do not match';
						}
						return null;
					},
				],
			},
			data,
		);

		if (Object.keys(errors).length > 0) {
			return fail(400, { invalid: true, errors: errors });
		}

		invariant(
			token && email && password && passwordConfirmation,
			'Missing required fields',
		);
		invariant(typeof token === 'string', 'Token must be a string');
		invariant(typeof email === 'string', 'Email must be a string');
		invariant(typeof password === 'string', 'Passsword must be a string');
		invariant(
			typeof passwordConfirmation === 'string',
			'Passsword must be a string',
		);

		const reset = await prisma.passwordReset.findUnique({
			where: { token },
			include: { account: true },
		});
		const invalidToken = () =>
			fail<{ errors: Record<string, string[]> }>(400, {
				errors: { global: ['Invalid reset password token.'] },
			});
		if (
			!reset?.account ||
			reset.account.email !== email ||
			reset.expires <= new Date()
		) {
			return invalidToken();
		}

		const hashedPassword = hashPassword(password);
		try {
			await prisma.$transaction([
				prisma.passwordReset.delete({
					where: { token, expires: { gt: new Date() } },
				}),
				prisma.accounts.update({
					where: { id: reset.account.id, email },
					data: { password: hashedPassword },
				}),
			]);
		} catch (cause) {
			if (
				cause instanceof Prisma.PrismaClientKnownRequestError &&
				cause.code === 'P2025'
			) {
				return invalidToken();
			}
			throw cause;
		}

		throw redirect(
			'/account/login',
			{
				type: 'success',
				message: 'Your password has been updated.',
			},
			event,
		);
	},
} satisfies Actions;
