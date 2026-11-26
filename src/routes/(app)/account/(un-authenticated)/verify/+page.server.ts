import { error, fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import invariant from 'tiny-invariant';

import { prisma } from '$lib/server/prisma';
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

	const verification = await prisma.emailVerification.findFirst({
		where: { token, expires: { gt: new Date() } },
		include: { account: true },
	});
	if (!verification || !verification.account) {
		throw error(422, 'Invalid email or token');
	}
	if (verification.expires < new Date()) {
		throw error(422, 'Token expired');
	}

	return { email, token };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const { request, locals } = event;

		const data = await request.formData();
		const email = data.get('email');
		const token = data.get('token');

		const errors = await validate(
			{
				token: [presenceValidator, stringValidator],
				email: [presenceValidator, emailValidator],
			},
			data,
		);

		if (Object.keys(errors).length > 0) {
			return fail(400, { invalid: true, errors: errors });
		}

		invariant(token && email, 'Missing required fields');
		invariant(typeof token === 'string', 'Token must be a string');
		invariant(typeof email === 'string', 'Email must be a string');

		const verification = await prisma.emailVerification.findFirst({
			where: { token, expires: { gt: new Date() } },
			include: { account: true },
		});
		if (!verification || !verification.account) {
			throw error(422, 'Invalid email or token');
		}
		if (verification.expires < new Date()) {
			throw error(422, 'Token expired');
		}

		const newEmail = verification.new_email;
		const account = verification.account;

		await prisma.$transaction([
			prisma.accounts.update({
				where: { id: account.id },
				data: {
					...(newEmail && newEmail !== account.email
						? { email: newEmail }
						: {}),
					is_verified: true,
				},
			}),
			prisma.emailVerification.deleteMany({
				where: { account_id: account.id },
			}),
		]);
		throw redirect(
			locals.session ? '/account' : '/account/login',
			{
				type: 'success',
				message: 'Your email has been verified.',
			},
			event,
		);
	},
} satisfies Actions;
