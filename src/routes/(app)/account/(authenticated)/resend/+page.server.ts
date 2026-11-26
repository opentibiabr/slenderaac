import { redirect } from 'sveltekit-flash-message/server';

import {
	resendEmailVerification,
	sendEmailVerificationLinks,
} from '$lib/server/email-verification';
import { allowRecoveryRequest } from '$lib/server/recovery-token';
import { requireLogin } from '$lib/server/session';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireLogin(locals);
	throw redirect(302, '/account');
};

export const actions = {
	default: async (event) => {
		const { locals } = event;
		requireLogin(locals);
		if (!allowRecoveryRequest('email-resend', event.getClientAddress, 20)) {
			throw redirect(
				'/account',
				{ type: 'error', message: 'Too many requests. Try again later.' },
				event,
			);
		}
		const result = await resendEmailVerification(locals.session.accountId);
		if (result.status === 'cooldown') {
			throw redirect(
				'/account',
				{
					type: 'error',
					message: 'Wait a minute before requesting another email.',
				},
				event,
			);
		}
		if (result.status === 'none') {
			throw redirect(
				'/account',
				{
					type: 'error',
					message:
						'No active confirmation. Start a new email change if needed.',
				},
				event,
			);
		}
		const delivered = await sendEmailVerificationLinks(result.mail);
		throw redirect(
			'/account',
			delivered
				? {
						type: 'success',
						message: 'Check the email addresses that still need to confirm.',
					}
				: {
						type: 'error',
						message:
							'Could not send all confirmation emails. Try resending in a minute.',
					},
			event,
		);
	},
} satisfies Actions;
