import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import invariant from 'tiny-invariant';

import {
	credentialChangeRejected,
	reauthenticateCredentialChange,
} from '$lib/server/credential-change';
import { errorCode, log } from '$lib/server/logging';
import { prisma } from '$lib/server/prisma';
import {
	clearWebSessionCookie,
	requireLogin,
	revokeWebSessions,
} from '$lib/server/session';
import { comparePassword, hashPassword } from '$lib/server/utils';
import {
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
		const currentPassword = data.get('currentPassword');
		const newPassword = data.get('newPassword');
		const token = data.get('token');

		const errors = await validate(
			{
				currentPassword: [presenceValidator, stringValidator],
				newPassword: [presenceValidator, stringValidator],
				newPasswordConfirm: [
					presenceValidator,
					stringValidator,
					(value) => (value === newPassword ? null : 'Passwords do not match'),
				],
			},
			data,
		);
		if (Object.keys(errors).length > 0) {
			return fail(400, { invalid: true, errors });
		}

		invariant(typeof currentPassword === 'string', 'Password must be a string');
		invariant(typeof newPassword === 'string', 'New password must be a string');

		const accountId = locals.session.accountId;
		let result;
		try {
			result = await prisma.$transaction(async (client) => {
				const auth = await reauthenticateCredentialChange(
					client,
					accountId,
					cookies,
					currentPassword,
					token,
				);
				if (auth.status !== 'authenticated') return auth;
				if (comparePassword(newPassword, auth.account.password)) {
					return { status: 'same-password' } as const;
				}
				await client.accounts.update({
					where: { id: accountId },
					data: { password: hashPassword(newPassword) },
				});
				await revokeWebSessions(client, accountId);
				return { status: 'changed' } as const;
			});
		} catch (error) {
			log(
				'error',
				'account.change-password',
				`failed code=${errorCode(error)}`,
			);
			return fail(500, {
				errors: { global: ['Failed to update password'] } as Record<
					string,
					string[]
				>,
			});
		}

		if (result.status === 'same-password') {
			return fail(400, {
				errors: {
					newPassword: ['New password cannot be the same as the old password'],
				} as Record<string, string[]>,
			});
		}
		if (result.status !== 'changed') {
			return credentialChangeRejected(cookies, result, 'currentPassword');
		}

		clearWebSessionCookie(cookies);
		throw redirect(
			'/account/login',
			{
				type: 'success',
				message: 'Password changed successfully. Please sign in again.',
			},
			event,
		);
	},
} satisfies Actions;
