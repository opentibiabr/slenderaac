import { json } from '@sveltejs/kit';
import { check as checkPort } from 'tcp-port-used';

import { PlayerGroup } from '$lib/players';
import { prisma } from '$lib/server/prisma';

import { SERVER_ADDRESS, SERVER_PORT } from '$env/static/private';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const serverOnline = await checkPort(Number(SERVER_PORT), SERVER_ADDRESS);
	const onlinePlayerCount = await prisma.playerOnline.count({
		where: { player: { group_id: { lt: PlayerGroup.Gamemaster } } },
	});

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
