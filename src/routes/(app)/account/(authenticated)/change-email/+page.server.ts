import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import invariant from 'tiny-invariant';

import {
	credentialChangeRejected,
	reauthenticateCredentialChange,
} from '$lib/server/credential-change';
import { sendVerificationEmail } from '$lib/server/email';
import { errorCode, log } from '$lib/server/logging';
import { prisma } from '$lib/server/prisma';
import {
	clearWebSessionCookie,
	requireLogin,
	revokeWebSessions,
} from '$lib/server/session';
import {
	emailValidator,
	presenceValidator,
	stringValidator,
	validate,
} from '$lib/server/validations';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
	return { tokenRequired: (await parent()).account.is2faEnabled };
}) satisfies PageServerLoad;

export const actions = {
	default: async (event) => {
		const { request, locals, cookies } = event;
		requireLogin(locals);

		const data = await request.formData();
		const password = data.get('password');
		const newEmail = data.get('newEmail');
		const token = data.get('token');

		const errors = await validate(
			{
				password: [presenceValidator, stringValidator],
				newEmail: [presenceValidator, emailValidator],
			},
			data,
		);
		if (Object.keys(errors).length > 0) {
			return fail(400, { invalid: true, errors });
		}

		invariant(typeof password === 'string', 'Password must be a string');
		invariant(typeof newEmail === 'string', 'Email must be a string');

		const accountId = locals.session.accountId;
		const email = newEmail.toLowerCase();
		let result;
		try {
			result = await prisma.$transaction(async (client) => {
				const auth = await reauthenticateCredentialChange(
					client,
					accountId,
					cookies,
					password,
					token,
				);
				if (auth.status !== 'authenticated') return auth;
				if (auth.account.email.toLowerCase() === email) {
					return { status: 'same-email' } as const;
				}
				const existing = await client.accounts.findUnique({
					where: { email },
					select: { id: true },
				});
				if (existing) return { status: 'email-unavailable' } as const;

				const updated = !auth.account.is_verified;
				if (updated) {
					await client.accounts.update({
						where: { id: accountId },
						data: { email },
					});
					await revokeWebSessions(client, accountId);
				}
				await client.emailVerification.deleteMany({
					where: { account_id: accountId },
				});
				const verification = await client.emailVerification.create({
					data: {
						account_id: accountId,
						expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
						new_email: email,
					},
					select: { token: true },
				});
				return {
					status: 'requested',
					updated,
					recipient: auth.account.email,
					verificationToken: verification.token,
				} as const;
			});
		} catch (error) {
			const code = errorCode(error);
			if (code === 'P2002') {
				return fail(400, {
					errors: { newEmail: ['This email is unavailable'] } as Record<
						string,
						string[]
					>,
				});
			}
			log('error', 'account.change-email', `failed code=${code}`);
			return fail(500, {
				errors: { global: ['Failed to request email change'] } as Record<
					string,
					string[]
				>,
			});
		}

		if (
			result.status === 'same-email' ||
			result.status === 'email-unavailable'
		) {
			return fail(400, {
				errors: {
					newEmail: [
						result.status === 'same-email'
							? 'New email must be different from current email'
							: 'This email is unavailable',
					],
				} as Record<string, string[]>,
			});
		}
		if (result.status !== 'requested') {
			return credentialChangeRejected(cookies, result, 'password');
		}

		if (result.updated) clearWebSessionCookie(cookies);

		try {
			await sendVerificationEmail(result.recipient, result.verificationToken);
		} catch (error) {
			log(
				'error',
				'account.change-email.mail',
				`failed code=${errorCode(error)}`,
			);
			if (result.updated) {
				throw redirect(
					'/account/login',
					{
						type: 'error',
						message:
							'Email updated, but the confirmation email could not be sent. Sign in with your new email to request another confirmation.',
					},
					event,
				);
			}
			return fail(503, {
				errors: {
					global: [
						'Your request was saved, but the confirmation email could not be sent. Submit the request again to retry.',
					],
				} as Record<string, string[]>,
			});
		}

		throw redirect(
			result.updated ? '/account/login' : '/account',
			{
				type: 'success',
				message: result.updated
					? 'Email updated. Please sign in again with your new email.'
					: 'Email change requested. Please check your email for a confirmation link.',
			},
			event,
		);
	},
} satisfies Actions;
