import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';

import { log } from '$lib/server/logging';
import { requestPasswordReset } from '$lib/server/password-recovery';
import { allowRecoveryRequest } from '$lib/server/recovery-token';
import {
	emailValidator,
	presenceValidator,
	validate,
} from '$lib/server/validations';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.session) throw redirect(302, '/');
	return { title: 'Account Lost' };
};

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = data.get('email');
		const errors = await validate(
			{ email: [presenceValidator, emailValidator] },
			data,
		);
		if (Object.keys(errors).length > 0 || typeof email !== 'string') {
			return fail(400, { invalid: true, errors });
		}

		if (allowRecoveryRequest('reset-request', event.getClientAddress, 12)) {
			// Exclude account lookup and SMTP latency from the public response.
			void requestPasswordReset(email.toLowerCase()).catch(() => {
				log('warn', 'account.password-reset', 'request failed');
			});
		}
		throw redirect(
			'/account/login',
			{
				type: 'success',
				message:
					'If an account with that email exists, a password reset link will be sent.',
			},
			event,
		);
	},
};
