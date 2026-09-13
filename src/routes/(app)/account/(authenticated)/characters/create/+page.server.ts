import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import invariant from 'tiny-invariant';

import { parsePlayerPronoun, parsePlayerSex } from '$lib/players';
import { generateCharacterInput } from '$lib/server/players';
import { prisma } from '$lib/server/prisma';
import { requireLogin } from '$lib/server/session';
import { getAvailableTowns } from '$lib/server/towns';
import {
	characterNameValidator,
	numberValidator,
	presenceValidator,
	stringValidator,
	validate,
} from '$lib/server/validations';

import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
	return { availableTowns: await getAvailableTowns() };
}) satisfies PageServerLoad;

export const actions = {
	default: async (event) => {
		const { request, locals } = event;
		requireLogin(locals);

		const data = await request.formData();
		const characterName = data.get('characterName');
		const characterSex = data.get('characterSex');
		const characterPronouns = data.get('characterPronouns');
		const startingTown = data.get('startingTown');
		const tutorial = data.get('tutorial');

		const errors = await validate(
			{
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
			characterName && characterSex && startingTown,
			'Missing required fields',
		);
		invariant(typeof characterName === 'string', 'Name must be a string');
		invariant(typeof characterSex === 'string', 'Sex must be a string');
		invariant(
			typeof startingTown === 'string',
			'Starting town must be a string',
		);

		const characterSexValue = parsePlayerSex(characterSex);
		const characterPronounsValue = parsePlayerPronoun(characterPronouns);
		const startingTownValue = Number(startingTown) ?? 1;

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

		const characterInput = await generateCharacterInput({
			name: characterName,
			pronoun: characterPronounsValue,
			sex: characterSexValue,
			startingTown: startingTownValue,
			tutorial: tutorial === 'on',
		});
		try {
			await prisma.players.create({
				data: {
					account_id: locals.session?.accountId,
					...characterInput,
				},
			});
		} catch (e) {
			console.error(e);
			return fail(500, {
				errors: {
					global: ['Failed to create character'],
				} as Record<string, string[]>,
			});
		}

		throw redirect(
			'/account',
			{
				message: `Character ${characterName} created!`,
				type: 'success',
			},
			event,
		);
	},
} satisfies Actions;
