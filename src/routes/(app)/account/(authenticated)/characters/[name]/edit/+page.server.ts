import { Prisma } from '@prisma/client';
import { error, fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import invariant from 'tiny-invariant';

import { parsePlayerPronoun } from '$lib/players';
import { prisma } from '$lib/server/prisma';
import { requireLogin } from '$lib/server/session';
import { stringValidator, validate } from '$lib/server/validations';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals, params }) => {
	requireLogin(locals);
	const characterName = params.name;
	invariant(characterName, 'Missing character name');

	const player = await prisma.players.findFirst({
		where: {
			name: characterName,
			account_id: locals.session.accountId,
			deletion: 0,
		},
		select: { name: true, pronoun: true, settings: true },
	});

	if (!player) throw error(404, 'Character not found');

	return {
		player: {
			name: player.name,
			pronoun: player.pronoun,
			settings: player.settings ?? {
				hidden: false,
				show_skills: true,
				show_inventory: true,
				comment: null,
			},
		},
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async (event) => {
		const { request, locals, params } = event;
		requireLogin(locals);

		const characterName = params.name;
		invariant(characterName, 'Missing character name');

		const data = await request.formData();
		const characterPronouns = data.get('pronoun');
		const characterHidden = data.get('characterHidden');
		const showSkills = data.get('showSkills');
		const showInventory = data.get('showInventory');
		const comment = data.get('comment');

		const errors = await validate({ comment: [stringValidator] }, data);
		if (Object.keys(errors).length > 0) {
			return fail(400, { invalid: true, errors: errors });
		}
		invariant(
			comment === null || typeof comment === 'string',
			'Comment must be a string or not set',
		);

		const settings = {
			hidden: characterHidden === 'on',
			show_skills: showSkills === 'on',
			show_inventory: showInventory === 'on',
			comment,
		};
		try {
			await prisma.players.update({
				where: {
					name: characterName,
					account_id: locals.session.accountId,
					deletion: 0,
				},
				data: {
					pronoun:
						characterPronouns === null
							? undefined
							: parsePlayerPronoun(characterPronouns),
					settings: { upsert: { create: settings, update: settings } },
				},
			});
		} catch (cause) {
			if (
				cause instanceof Prisma.PrismaClientKnownRequestError &&
				cause.code === 'P2025'
			)
				return fail(404, { errors: { global: ['Character not found'] } });
			throw cause;
		}

		throw redirect(
			'/account',
			{
				message: `Character ${characterName} saved!`,
				type: 'success',
			},
			event,
		);
	},
} satisfies Actions;
