import { PlayerGroup, type PlayerWithRank, vocationIds } from '$lib/players';
import { dbToPlayer, PlayerSelectForList } from '$lib/server/players';
import { prisma } from '$lib/server/prisma';
import { isSkill, skillToColumn } from '$lib/server/skills';

import type { PageServerLoad } from './$types';

const PER_PAGE = 50;
const MAX_PER_PAGE = 200;

function positiveInteger(value: string | null, fallback: number) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

export const load = (async ({ url }) => {
	const skillParam = url.searchParams.get('skill');
	const skill = isSkill(skillParam) ? skillParam : 'experience';
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
