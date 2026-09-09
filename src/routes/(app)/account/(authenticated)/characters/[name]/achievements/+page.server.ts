import { Prisma } from '@prisma/client';
import { error, fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';

import {
	MAX_SHOWCASE_ACHIEVEMENTS,
	selectedAchievements,
	showcaseSelection,
} from '$lib/achievement-showcase';
import { loadAchievements } from '$lib/server/catalog';
import { nativeCharacterAchievements } from '$lib/server/character-achievements';
import { prisma } from '$lib/server/prisma';
import { requireLogin } from '$lib/server/session';
import { themePreviewHref, themePreviewLoginHref } from '$lib/themes/preview';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals, params, url }) => {
	requireLogin(locals, '', themePreviewLoginHref(url));
	const player = await prisma.players.findFirst({
		where: {
			name: params.name,
			account_id: locals.session.accountId,
			deletion: 0,
		},
		select: {
			id: true,
			name: true,
			achievement_showcase: {
				select: { achievement_id: true },
				orderBy: { position: 'asc' },
				take: MAX_SHOWCASE_ACHIEVEMENTS,
			},
		},
	});
	if (!player) throw error(404, 'Character not found');
	const catalog = await loadAchievements();
	const achievements = await nativeCharacterAchievements(player.id, catalog);
	return {
		characterName: player.name,
		configured: catalog.length > 0,
		earned: achievements.earned,
		selected: selectedAchievements(
			player.achievement_showcase.map((entry) => entry.achievement_id),
			achievements.earned,
		).map((entry) => entry.id.toString()),
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async (event) => {
		const { locals, params, request, url } = event;
		requireLogin(locals, '', themePreviewLoginHref(url));
		const values = (await request.formData()).getAll('achievement');
		if (values.length > MAX_SHOWCASE_ACHIEVEMENTS)
			return fail(400, {
				message: `Select up to ${MAX_SHOWCASE_ACHIEVEMENTS} achievements.`,
			});
		const catalog = await loadAchievements();
		if (!catalog.length)
			return fail(503, {
				message: 'Achievement details are unavailable. Please try again later.',
			});
		const accountId = locals.session.accountId;
		try {
			const result = await prisma.$transaction(
				async (database) => {
					const player = await database.players.findFirst({
						where: { name: params.name, account_id: accountId, deletion: 0 },
						select: { id: true },
					});
					if (!player) return 'missing';
					const achievements = await nativeCharacterAchievements(
						player.id,
						catalog,
						database,
					);
					const selection = showcaseSelection(values, achievements.earned);
					if (selection === null) return 'invalid';
					await database.achievementShowcase.deleteMany({
						where: { player_id: player.id },
					});
					if (selection.length)
						await database.achievementShowcase.createMany({
							data: selection.map((id, position) => ({
								player_id: player.id,
								achievement_id: id,
								position,
							})),
						});
					return 'saved';
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
			);
			if (result === 'missing')
				return fail(404, { message: 'Character not found.' });
			if (result === 'invalid')
				return fail(400, {
					message:
						'Select only achievements this character has unlocked, without duplicates.',
				});
		} catch (cause) {
			if (
				cause instanceof Prisma.PrismaClientKnownRequestError &&
				['P2002', 'P2034'].includes(cause.code)
			)
				return fail(409, {
					message:
						'The character changed while saving. Reload the page and try again.',
				});
			throw cause;
		}
		throw redirect(
			themePreviewHref(url, `/characters/${encodeURIComponent(params.name)}`),
			{
				type: 'success',
				message: 'Achievement selection saved.',
			},
			event,
		);
	},
} satisfies Actions;
