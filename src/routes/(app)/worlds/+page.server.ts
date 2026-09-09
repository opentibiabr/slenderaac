import { error } from '@sveltejs/kit';

import {
	loadOnlinePlayers,
	publicOnlinePlayers,
} from '$lib/server/online-players';
import { prisma } from '$lib/server/prisma';
import { serverReachable } from '$lib/server/server-status';
import { configuredWorld } from '$lib/server/worlds';
import { onlineRecord, worldSorting } from '$lib/worlds';

import { SERVER_ADDRESS, SERVER_PORT } from '$env/static/private';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const world = await configuredWorld();
	const selected = url.searchParams.get('world') || null;
	if (selected && selected.toLowerCase() !== world.name.toLowerCase())
		throw error(404, 'World not found');
	const { sort, order } = worldSorting(url.searchParams);
	const [record, characters, count, online] = await Promise.all([
		prisma.serverConfig.findUnique({ where: { config: 'players_record' } }),
		selected ? loadOnlinePlayers(sort, order, 'name') : [],
		selected ? null : prisma.playerOnline.count({ where: publicOnlinePlayers }),
		selected ? serverReachable(SERVER_ADDRESS, SERVER_PORT) : null,
	]);
	return {
		title: 'Worlds',
		world,
		selected: Boolean(selected),
		online,
		onlineRecord: onlineRecord(record?.value),
		onlineCount: count ?? characters.length,
		characters,
		sort,
		order,
	};
}) satisfies PageServerLoad;
