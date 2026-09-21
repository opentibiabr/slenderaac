import { Prisma } from '@prisma/client';

import {
	collectionCoverage,
	type KillTotals,
	killWindow,
} from '$lib/kill-statistics';
import { prisma } from '$lib/server/prisma';

export async function loadKillStatistics(now = Math.floor(Date.now() / 1000)) {
	const minute = killWindow(now).end;
	if (cache && cache.minute === minute && now < cache.expires)
		return cache.result;
	const result = queryKillStatistics(now).catch((error: unknown) => {
		if (cache?.result === result) cache = undefined;
		throw error;
	});
	cache = { minute, expires: now + 10, result };
	return result;
}

let cache:
	| {
			minute: number;
			expires: number;
			result: ReturnType<typeof queryKillStatistics>;
	  }
	| undefined;

async function queryKillStatistics(now: number) {
	const window = killWindow(now);
	const [collectors, rows] = await prisma.$transaction([
		prisma.killCollector.findMany({
			where: { updated_at: { gte: window.week * 60 } },
			select: { started_at: true, updated_at: true, dropped_events: true },
		}),
		prisma.$queryRaw<
			{
				race: string;
				dayPlayers: Prisma.Decimal;
				dayMonsters: Prisma.Decimal;
				weekPlayers: Prisma.Decimal;
				weekMonsters: Prisma.Decimal;
			}[]
		>(Prisma.sql`
			SELECT race,
			 SUM(CASE WHEN minute >= ${window.day} THEN players_killed ELSE 0 END) AS dayPlayers,
			 SUM(CASE WHEN minute >= ${window.day} THEN killed_by_players ELSE 0 END) AS dayMonsters,
			 SUM(players_killed) AS weekPlayers, SUM(killed_by_players) AS weekMonsters
			FROM slender_kill_statistics WHERE minute >= ${window.week} AND minute < ${window.end}
			GROUP BY race ORDER BY race ASC
		`),
	]);
	return {
		coverage: collectionCoverage(collectors, now),
		rows: rows.map(
			(row): KillTotals => ({
				race: row.race,
				dayPlayers: Number(row.dayPlayers),
				dayMonsters: Number(row.dayMonsters),
				weekPlayers: Number(row.weekPlayers),
				weekMonsters: Number(row.weekMonsters),
			}),
		),
		through: window.end * 60,
	};
}
