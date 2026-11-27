import { type ActionFailure, error, fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';

import {
	completePasswordReset,
	getPasswordResetChallenge,
	notifyPasswordReset,
} from '$lib/server/password-recovery';
import {
	allowRecoveryRequest,
	recoveryPageHeaders,
} from '$lib/server/recovery-token';
import {
	presenceValidator,
	stringValidator,
	validate,
} from '$lib/server/validations';

import type { Actions, PageServerLoad } from './$types';

const INVALID_LINK =
	'This password reset link is invalid or expired. Request a new link.';

export const load = (async ({ setHeaders, url }) => {
	setHeaders(recoveryPageHeaders);
	const token = url.searchParams.get('token');
	const challenge = await getPasswordResetChallenge(token);
	if (!challenge) throw error(422, INVALID_LINK);
	return { token, ...challenge };
}) satisfies PageServerLoad;

export const actions = {
	default: async (
		event,
	): Promise<ActionFailure<{ errors: Record<string, string[]> }>> => {
		const data = await event.request.formData();
		const password = data.get('password');
		const errors = await validate(
			{
				password: [presenceValidator, stringValidator],
				passwordConfirmation: [
					presenceValidator,
					stringValidator,
					(value) => (value === password ? null : 'Passwords do not match'),
				],
			},
			data,
		);
		if (Object.keys(errors).length > 0 || typeof password !== 'string') {
			return fail(400, { errors });
		}
		if (!allowRecoveryRequest('reset-submit', event.getClientAddress, 30)) {
			return fail(429, {
				errors: { global: ['Too many attempts. Try again later.'] },
			});
		}

		const result = await completePasswordReset(
			data.get('token'),
			password,
			data.get('factor'),
		);
		if (result.status === 'invalid')
			return fail(400, { errors: { global: [INVALID_LINK] } });
		if (result.status === 'same-password') {
			return fail(400, {
				errors: { password: ['Choose a different password.'] },
			});
		}
		if (result.status === 'factor') {
			return fail(400, {
				errors: { factor: ['Enter a valid authenticator or recovery code.'] },
			});
		}

		if (event.locals.session?.accountId === result.accountId) {
			event.cookies.delete('sid', { path: '/' });
		}
		void notifyPasswordReset(result.email);
		throw redirect(
			'/account/login',
			{ type: 'success', message: 'Your password has been updated.' },
			event,
		);
	},
} satisfies Actions;
