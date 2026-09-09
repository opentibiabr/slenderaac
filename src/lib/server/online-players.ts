import type { Order, Sort } from '$lib/sorting';
import { PlayerGroup } from '$lib/players';
import { dbToPlayer, PlayerSelectForList } from '$lib/server/players';
import { prisma } from '$lib/server/prisma';

export const publicOnlinePlayers = {
	player: { group_id: { lt: PlayerGroup.Gamemaster }, deletion: 0 },
};

export async function loadOnlinePlayers(sort: Sort, order: Order) {
	const rows = await prisma.playerOnline.findMany({
		select: { player: { select: PlayerSelectForList } },
		where: publicOnlinePlayers,
		orderBy: [
			{ player: { [sort]: order } },
			...(sort !== 'name' ? [{ player: { name: 'asc' as const } }] : []),
		],
	});
	return rows.map(({ player }) => dbToPlayer(player));
}
