import { PlayerGroup } from '$lib/players';
import { dbToPlayer, PlayerSelectForList } from '$lib/server/players';
import { prisma } from '$lib/server/prisma';
import { isOrder, isSort } from '$lib/sorting';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const requestedSort = url.searchParams.get('sort');
	const requestedOrder = url.searchParams.get('order');
	const sort = isSort(requestedSort) ? requestedSort : 'name';
	const order = isOrder(requestedOrder) ? requestedOrder : 'asc';

	const characters = (
		await prisma.playerOnline.findMany({
			select: {
				player: {
					select: PlayerSelectForList,
				},
			},
			where: { player: { group_id: { lt: PlayerGroup.Gamemaster } } },
			orderBy: { player: { [sort]: order } },
		})
	).map(({ player }) => player);

	return {
		title: "Who's online?",
		characters: characters.map(dbToPlayer),
		sort,
		order,
	};
}) satisfies PageServerLoad;
