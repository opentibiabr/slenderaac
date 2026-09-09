import { json } from '@sveltejs/kit';

import { publicOnlinePlayers } from '$lib/server/online-players';
import { prisma } from '$lib/server/prisma';
import { serverReachable } from '$lib/server/server-status';

import { SERVER_ADDRESS, SERVER_PORT } from '$env/static/private';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const [serverOnline, onlinePlayerCount] = await Promise.all([
		serverReachable(SERVER_ADDRESS, SERVER_PORT),
		prisma.playerOnline.count({ where: publicOnlinePlayers }),
	]);

	return json({
		serverOnline,
		onlinePlayerCount,
		topbarStats: {
			twitchChannels: 0,
			twitchViewers: 0,
			youtubeChannels: 0,
			youtubeViewers: 0,
		},
	});
};
