import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import invariant from 'tiny-invariant';

import { AccountType } from '$lib/accounts';
import { parsePlayerPronoun, parsePlayerSex } from '$lib/players';
import { sendVerificationEmail } from '$lib/server/email';
import { generateCharacterInput } from '$lib/server/players';
import { prisma } from '$lib/server/prisma';
import { getAvailableTowns } from '$lib/server/towns';
import { hashPassword } from '$lib/server/utils';
import {
	characterNameValidator,
	emailValidator,
	numberValidator,
	presenceValidator,
	stringValidator,
	validate,
} from '$lib/server/validations';

import { AUTO_ADMIN_EMAIL } from '$env/static/private';

import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
	return {
		title: 'Create Account',
		availableTowns: await getAvailableTowns(),
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async (event) => {
		const { request } = event;

		const data = await request.formData();
		let email = data.get('email');
		const password = data.get('password');
		const characterName = data.get('characterName');
		const characterSex = data.get('characterSex');
		const characterPronouns = data.get('characterPronouns');
		const startingTown = data.get('startingTown');

		const errors = await validate(
			{
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
				characterName: [presenceValidator, characterNameValidator],
				characterSex: [presenceValidator, stringValidator],
				startingTown: [presenceValidator, numberValidator],
			},
			data,
		);

		if (Object.keys(errors).length > 0) {
			return fail(400, { invalid: true, errors: errors });
		}

		invariant(
			email && password && characterName && characterSex,
			'Missing required fields',
		);
		invariant(typeof email === 'string', 'Email must be a string');
		invariant(typeof password === 'string', 'Password must be a string');
		invariant(typeof characterName === 'string', 'Name must be a string');
		invariant(typeof characterSex === 'string', 'Name must be a string');
		invariant(
			typeof startingTown === 'string',
			'Starting town must be a string',
		);

		const characterSexValue = parsePlayerSex(characterSex);
		const characterPronounsValue = parsePlayerPronoun(characterPronouns);
		const startingTownValue = Number(startingTown) ?? 1;
		const tutorial = data.get('tutorial');

		email = email.toLowerCase();

		const account = await prisma.accounts.findUnique({ where: { email } });
		if (account) {
			return fail(400, {
				errors: {
					email: ['Email is already taken'],
				} as Record<string, string[]>,
			});
		}

		const hashedPassword = hashPassword(password);
		const characterInput = await generateCharacterInput({
			name: characterName,
			pronoun: characterPronounsValue,
			sex: characterSexValue,
			startingTown: startingTownValue,
			tutorial: tutorial === 'on',
		});

		const existingPlayer = await prisma.players.findFirst({
			where: { name: characterName },
		});
		if (existingPlayer) {
			return fail(400, {
				errors: {
					characterName: ['Character name is already taken'],
				} as Record<string, string[]>,
			});
		}

		const isAdmin = email === AUTO_ADMIN_EMAIL;

		const created = await prisma.accounts.create({
			data: {
				email,
				password: hashedPassword,
				creation: Math.trunc(Date.now() / 1000),

				type: isAdmin ? AccountType.God : AccountType.Normal,

				players: {
					createMany: {
						data: [{ ...characterInput, is_main: true }],
					},
				},

				emailVerifications: {
					create: {
						expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
					},
				},
			},
			include: {
				emailVerifications: true,
			},
		});
		if (!created || !created.emailVerifications[0]) {
			return fail(400, {
				errors: {
					global: ['Failed to create account'],
				} as Record<string, string[]>,
			});
		}
		await sendVerificationEmail(
			created.email,
			created.emailVerifications[0].token,
		);
		throw redirect(
			'/account/login',
			{
				type: 'success',
				message: 'Account created. Check your email to confirm your account.',
			},
			event,
		);
	},
} satisfies Actions;
