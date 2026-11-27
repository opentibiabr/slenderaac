import { error, fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';

import {
	confirmEmailVerification,
	hasEmailVerification,
} from '$lib/server/email-verification';
import {
	allowRecoveryRequest,
	recoveryPageHeaders,
} from '$lib/server/recovery-token';

import type { Actions, PageServerLoad } from './$types';

const INVALID_LINK =
	'This email confirmation link is invalid or expired. Request a new link from your account.';

export const load = (async ({ setHeaders, url }) => {
	setHeaders(recoveryPageHeaders);
	const token = url.searchParams.get('token');
	if (!(await hasEmailVerification(token))) throw error(422, INVALID_LINK);
	return { token };
}) satisfies PageServerLoad;

export const actions = {
	default: async (event) => {
		if (!allowRecoveryRequest('email-verify', event.getClientAddress, 30)) {
			return fail(429, {
				errors: { global: ['Too many attempts. Try again later.'] },
			});
		}
		const data = await event.request.formData();
		const result = await confirmEmailVerification(data.get('token'));
		if (result === 'invalid')
			return fail(400, { errors: { global: [INVALID_LINK] } });
		if (result === 'unavailable') {
			return fail(400, {
				errors: {
					global: [
						'This address is unavailable. Request another email change from your account.',
					],
				},
			});
		}
		const message =
			result === 'pending'
				? 'Address confirmed. The other address must also confirm this change.'
				: 'Your email address has been confirmed.';
		throw redirect(
			event.locals.session ? '/account' : '/account/login',
			{ type: 'success', message },
			event,
		);
	},
} satisfies Actions;
