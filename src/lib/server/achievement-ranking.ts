import { achievementPoints } from './achievement-points';
import { prisma } from './prisma';

type PointRow = { key_name: string; value: Uint8Array | null };
type ReadRows = (after: string) => Promise<PointRow[]>;
const BATCH_SIZE = 1000;
const CACHE_MS = 30_000;

/** Cache only native point scalars. Player visibility is checked for each request. */
export function createAchievementPointCache(read: ReadRows, now = Date.now) {
	let snapshot: ReadonlyMap<number, number | null> | undefined;
	let expires = 0;
	let pending: Promise<ReadonlyMap<number, number | null>> | undefined;
	async function refresh() {
		const points = new Map<number, number | null>();
		let after = '';
		let rows: PointRow[];
		do {
			rows = await read(after);
			for (const row of rows) {
				const match = /^player\.([1-9]\d*)\.achievements\.points$/.exec(
					row.key_name,
				);
				if (!match) continue;
				const playerId = Number(match[1]);
				if (!Number.isSafeInteger(playerId)) continue;
				points.set(playerId, achievementPoints(row.value));
			}
			after = rows.at(-1)?.key_name ?? after;
		} while (rows.length === BATCH_SIZE);
		snapshot = points;
		expires = now() + CACHE_MS;
		return snapshot;
	}
	return async () => {
		if (snapshot && now() < expires) return snapshot;
		pending ??= refresh().finally(() => {
			pending = undefined;
		});
		return pending;
	};
}

export const nativeAchievementPoints = createAchievementPointCache(
	(after) =>
		prisma.$queryRaw<PointRow[]>`
		SELECT key_name,
			CASE WHEN OCTET_LENGTH(value) BETWEEN 2 AND 11 THEN value ELSE NULL END AS value
		FROM kv_store
		WHERE key_name LIKE 'player.%.achievements.points' AND key_name > ${after}
		ORDER BY key_name ASC LIMIT ${BATCH_SIZE}
	`,
);

export function rankAchievementPlayers(
	playerIds: readonly number[],
	points: ReadonlyMap<number, number | null>,
) {
	return playerIds
		.flatMap((playerId) => {
			const score = points.has(playerId) ? points.get(playerId) : 0;
			return typeof score === 'number' ? [{ playerId, points: score }] : [];
		})
		.sort(
			(left, right) =>
				right.points - left.points || left.playerId - right.playerId,
		);
}
