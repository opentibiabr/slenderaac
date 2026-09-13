import { PlayerGroup, type PlayerWithRank, vocationIds } from '$lib/players';
import {
	nativeAchievementPoints,
	rankAchievementPlayers,
} from '$lib/server/achievement-ranking';
import { dbToPlayer, PlayerSelectForList } from '$lib/server/players';
import { prisma } from '$lib/server/prisma';
import { isSkill, skillToColumn } from '$lib/server/skills';
import { configuredWorld } from '$lib/server/worlds';

import type { PageServerLoad } from './$types';

const PER_PAGE = 50;
const MAX_PER_PAGE = 200;

function positiveInteger(value: string | null, fallback: number) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

export const load = (async ({ url }) => {
	const world = await configuredWorld();
	const skillParam = url.searchParams.get('skill');
	const skill =
		skillParam === 'achievements' || isSkill(skillParam)
			? skillParam
			: 'experience';
	const vocationParam = url.searchParams.get('vocation') ?? 'all';
	const vocation = vocationIds(vocationParam).length
		? vocationParam.toLowerCase()
		: 'all';
	const take = Math.min(
		positiveInteger(url.searchParams.get('limit'), PER_PAGE),
		MAX_PER_PAGE,
	);
	const where = {
		deletion: 0,
		group_id: { lt: PlayerGroup.Gamemaster },
		vocation: vocation === 'all' ? undefined : { in: vocationIds(vocation) },
	};
	if (skill === 'achievements') {
		const { points, updatedAt } = await nativeAchievementPoints();
		const ids: number[] = [];
		let after = 0;
		let players: { id: number }[];
		do {
			players = await prisma.players.findMany({
				where: { ...where, id: { gt: after } },
				select: { id: true },
				orderBy: { id: 'asc' },
				take: 1000,
			});
			ids.push(...players.map((player) => player.id));
			after = players.at(-1)?.id ?? after;
		} while (players.length === 1000);
		const ranking = rankAchievementPlayers(ids, points);
		const count = ranking.length;
		const page = Math.min(
			positiveInteger(url.searchParams.get('page'), 1),
			Math.max(1, Math.ceil(count / take)),
		);
		const skip = (page - 1) * take;
		const entries = ranking.slice(skip, skip + take);
		const visiblePlayers = await prisma.players.findMany({
			where: { ...where, id: { in: entries.map((entry) => entry.playerId) } },
			select: PlayerSelectForList,
		});
		const playersById = new Map(
			visiblePlayers.map((player) => [player.id, player]),
		);
		return {
			title: 'Highscores',
			world,
			updatedAt,
			characters: entries.flatMap((entry, index): PlayerWithRank[] => {
				const player = playersById.get(entry.playerId);
				return player
					? [
							{
								...dbToPlayer(player),
								rank: skip + index + 1,
								skill: entry.points.toLocaleString(undefined),
							},
						]
					: [];
			}),
			page,
			limit: take,
			offset: page - 1,
			skill,
			count,
			vocation,
		};
	}
	const count = await prisma.players.count({ where });
	const page = Math.min(
		positiveInteger(url.searchParams.get('page'), 1),
		Math.max(1, Math.ceil(count / take)),
	);
	const skip = (page - 1) * take;
	const skillColumn = skillToColumn(skill);

	const characters = await prisma.players.findMany({
		where,
		select: PlayerSelectForList,
		orderBy: { [skillColumn]: 'desc' },
		take,
		skip,
	});

	return {
		title: 'Highscores',
		world,
		updatedAt: new Date(),
		characters: characters.map(dbToPlayer).map(
			(player, index): PlayerWithRank => ({
				...player,
				rank: skip + index + 1,
				skill: characters[index][skillColumn].toLocaleString(undefined),
			}),
		),
		page,
		limit: take,
		offset: page - 1,
		skill,
		count,
		vocation,
	};
}) satisfies PageServerLoad;
