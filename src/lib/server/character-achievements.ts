import type { Prisma } from '@prisma/client';

import type { AchievementRecord } from '$lib/achievements';

import { prisma } from './prisma';
import { storageNumber } from './storage-values';

export async function nativeCharacterAchievements(
	playerId: number,
	catalog: readonly AchievementRecord[],
	database: Pick<Prisma.TransactionClient, 'kv_store'> = prisma,
) {
	const scope = `player.${playerId}.achievements.`;
	const pointsKey = scope + 'points';
	const unlockedKey = (name: string) => scope + 'unlocked.' + name;
	const rows = await database.kv_store.findMany({
		where: {
			key_name: {
				in: [pointsKey, ...catalog.map((entry) => unlockedKey(entry.name))],
			},
		},
		select: { key_name: true, value: true },
	});
	const values = new Map(
		rows.map((row) => [row.key_name, storageNumber(row.value)]),
	);
	const points = values.has(pointsKey) ? values.get(pointsKey) : 0;
	return {
		points:
			typeof points === 'number' &&
			Number.isInteger(points) &&
			points >= 0 &&
			points <= 65535
				? points
				: null,
		earned: catalog.filter((entry) => {
			const value = values.get(unlockedKey(entry.name));
			return typeof value === 'number' && Number.isInteger(value);
		}),
	};
}
