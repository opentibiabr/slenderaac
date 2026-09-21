import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

void test(
	'database totals honor minute boundaries, separate runs and idempotent writes',
	{ skip: process.env.SLENDER_TEST_DATABASE !== 'true' },
	async () => {
		const { prisma } = await import('./prisma');
		const { loadKillStatistics } = await import('./kill-statistics');
		const id = randomUUID();
		const other = randomUUID();
		const race = `statistics-test-${id}`;
		const now = Math.floor(Date.now() / 60000) * 60;
		const minute = now / 60;
		try {
			await prisma.killCollector.createMany({
				data: [id, other].map((id) => ({
					id,
					started_at: now - 700000,
					updated_at: now,
				})),
			});
			await prisma.killStatistic.createMany({
				data: [
					{ minute: minute - 1, players_killed: 2, killed_by_players: 3 },
					{ minute: minute - 1440, players_killed: 5, killed_by_players: 7 },
					{ minute: minute - 1441, players_killed: 11, killed_by_players: 13 },
					{ minute: minute - 10080, players_killed: 17, killed_by_players: 19 },
					{
						minute: minute - 10081,
						players_killed: 1000,
						killed_by_players: 1000,
					},
					{ minute, players_killed: 1000, killed_by_players: 1000 },
					{ minute: minute + 1, players_killed: 1000, killed_by_players: 1000 },
				].map((row) => ({ ...row, collector_id: id, race })),
			});
			const contribution = {
				collector_id: other,
				minute: minute - 1,
				race,
				players_killed: 1,
				killed_by_players: 1,
			};
			for (let attempt = 0; attempt < 2; attempt++) {
				await prisma.$executeRaw`INSERT INTO slender_kill_statistics (collector_id, minute, race, players_killed, killed_by_players)
			 VALUES (${other}, ${contribution.minute}, ${race}, 1, 1)
			 ON DUPLICATE KEY UPDATE players_killed=VALUES(players_killed), killed_by_players=VALUES(killed_by_players)`;
			}
			const result = await loadKillStatistics(now);
			assert.deepEqual(
				result.rows.find((row) => row.race === race),
				{
					race,
					dayPlayers: 8,
					dayMonsters: 11,
					weekPlayers: 36,
					weekMonsters: 43,
				},
			);
			assert.equal(Object.hasOwn(result.rows[0], 'collector_id'), false);
		} finally {
			await prisma.killCollector.deleteMany({
				where: { id: { in: [id, other] } },
			});
			await prisma.$disconnect();
		}
	},
);
