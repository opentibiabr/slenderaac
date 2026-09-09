import type { Order, Sort } from '$lib/sorting';
import { PlayerGroup, vocationString } from '$lib/players';
import { dbToPlayer, PlayerSelectForList } from '$lib/server/players';
import { prisma } from '$lib/server/prisma';

export const publicOnlinePlayers = {
	player: { group_id: { lt: PlayerGroup.Gamemaster }, deletion: 0 },
};

export async function loadOnlinePlayers(
	sort: Sort,
	order: Order,
	vocationOrder: 'id' | 'name' = 'id',
) {
	const rows = await prisma.playerOnline.findMany({
		select: { player: { select: PlayerSelectForList } },
		where: publicOnlinePlayers,
		orderBy: [
			{ player: { [sort]: order } },
			...(sort !== 'name' ? [{ player: { name: 'asc' as const } }] : []),
		],
	});
	const players = rows.map(({ player }) => dbToPlayer(player));
	if (sort === 'vocation' && vocationOrder === 'name')
		players.sort(
			(a, b) =>
				vocationString(a.vocation).localeCompare(
					vocationString(b.vocation),
					'en',
				) * (order === 'asc' ? 1 : -1) ||
				b.level - a.level ||
				a.name.localeCompare(b.name, 'en'),
		);
	return players;
}
