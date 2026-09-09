import {
	MAX_SHOWCASE_ACHIEVEMENTS,
	selectedAchievements,
} from '$lib/achievement-showcase';
import { loadAchievements } from '$lib/server/catalog';
import { nativeCharacterAchievements } from '$lib/server/character-achievements';
import { dbToItem } from '$lib/server/items';
import {
	dbToPlayer,
	dbToSkills,
	PlayerSelectForList,
} from '$lib/server/players';
import { prisma } from '$lib/server/prisma';
import { $_ } from '$lib/utils';

import type { PageServerLoad } from './$types';

const MAX_CHARACTERS_PER_PAGE = 100;

export const load = (async ({ params }) => {
	const player = await prisma.players.findFirst({
		where: {
			name: params.name,
			deletion: 0,
		},
		select: {
			...PlayerSelectForList,
			balance: true,
			town_id: true,
			lastlogin: true,
			account_id: true,
			settings: true,
			achievement_showcase: {
				select: { achievement_id: true },
				orderBy: { position: 'asc' },
				take: MAX_SHOWCASE_ACHIEVEMENTS,
			},
			deaths: {
				take: 20,
				orderBy: { time: 'desc' },
			},
		},
		take: MAX_CHARACTERS_PER_PAGE,
	});
	if (!player) {
		return {
			status: 404,
			error: $_('characters-not-found', { values: { name: params.name } }),
		};
	}
	const town = await prisma.towns.findUniqueOrThrow({
		where: { id: player?.town_id },
		select: { name: true },
	});

	const accountCharacters = player.settings?.hidden
		? []
		: (
				await prisma.players.findMany({
					where: {
						account_id: player.account_id,
						deletion: 0,
						OR: [{ settings: { hidden: false } }, { settings: null }],
					},
					select: { ...PlayerSelectForList },
				})
			).map(dbToPlayer);

	const showSkills = player.settings?.show_skills ?? true;
	const showInventory = player.settings?.show_inventory ?? true;
	const catalog = await loadAchievements();
	const achievements = await nativeCharacterAchievements(player.id, catalog);

	const inventory = !showInventory
		? []
		: (
				await prisma.playerItems.findMany({
					where: {
						player_id: player.id,
					},
				})
			).map(dbToItem);

	return {
		character: dbToPlayer({ ...player, town: town }),
		deaths: player.deaths,
		balance: showInventory ? player.balance : null,
		skills: showSkills ? dbToSkills(player) : null,
		inventory: showInventory ? inventory : null,
		accountCharacters,
		achievementPoints: achievements.points,
		achievementsAvailable: catalog.length > 0,
		achievements: selectedAchievements(
			player.achievement_showcase.map((entry) => entry.achievement_id),
			achievements.earned,
		),
	};
}) satisfies PageServerLoad;
