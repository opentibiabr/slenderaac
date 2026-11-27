import { type ActionFailure, fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';

import { credentialChangeRejected } from '$lib/server/credential-change';

import {
	requestEmailChange,
	sendEmailVerificationLinks,
} from '$lib/server/email-verification';
import { allowRecoveryRequest } from '$lib/server/recovery-token';
import { requireLogin } from '$lib/server/session';
import {
	emailValidator,
	presenceValidator,
	stringValidator,
	validate,
} from '$lib/server/validations';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({});

export const actions = {
	default: async (
		event,
	): Promise<ActionFailure<{ errors: Record<string, string[]> }>> => {
		const { cookies, locals } = event;
		requireLogin(locals);
		const data = await event.request.formData();
		const password = data.get('password');
		const newEmail = data.get('newEmail');
		const errors = await validate(
			{
				password: [presenceValidator, stringValidator],
				newEmail: [presenceValidator, emailValidator],
			},
			data,
		);
		if (
			Object.keys(errors).length > 0 ||
			typeof password !== 'string' ||
			typeof newEmail !== 'string'
		) {
			return fail(400, { errors });
		}
		if (newEmail.trim().length > 255) {
			return fail(400, {
				errors: { newEmail: ['Enter a valid email address.'] },
			});
		}
		if (
			!allowRecoveryRequest('email-change', event.getClientAddress, 20) ||
			!allowRecoveryRequest(
				'email-change-account',
				() => String(locals.session.accountId),
				8,
			)
		) {
			return fail(429, {
				errors: { global: ['Too many requests. Try again later.'] },
			});
		}
		const result = await requestEmailChange(
			locals.session.accountId,
			newEmail.trim().toLowerCase(),
			password,
			data.get('factor'),
			cookies,
		);
		switch (result.status) {
			case 'session-ended':
			case 'rate-limited':
			case 'invalid-password':
				return credentialChangeRejected(cookies, result, 'password');
			case 'address':
				return fail(400, {
					errors: { newEmail: ['Enter a different available email address.'] },
				});
			case 'invalid-token':
				return fail(400, {
					errors: { factor: ['Enter a valid authenticator or recovery code.'] },
				});
			case 'cooldown':
				return fail(429, {
					errors: {
						global: [
							'Wait a minute before changing or resending confirmation emails.',
						],
					},
				});
		}
		const delivered = await sendEmailVerificationLinks(result.mail);
		throw redirect(
			'/account',
			delivered
				? {
						type: 'success',
						message:
							'Email change requested. Follow the confirmation instructions in your inbox.',
					}
				: {
						type: 'error',
						message:
							'Email change requested. Use resend in your account if a confirmation email is missing.',
					},
			event,
		);
	},
} satisfies Actions;
