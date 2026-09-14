/* Prisma delegates are replaced and restored with asynchronous test doubles. */
/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/require-await */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	dailyRewardState,
	loadAccountRewardStates,
} from '$lib/server/account-character-status';
import { prisma } from '$lib/server/prisma';

void test('daily rewards follow the server-save cycle, not the website date or stale player flag', () => {
	const cycle = 1_789_400_000;
	assert.equal(dailyRewardState(cycle, cycle), 'collected');
	assert.equal(dailyRewardState(cycle, cycle - 86_400), 'uncollected');
	assert.equal(dailyRewardState(cycle), 'uncollected');
	assert.equal(
		dailyRewardState(cycle, cycle - 86_400, cycle + 60),
		'collected',
	);
	assert.equal(
		dailyRewardState(cycle + 86_400, cycle, cycle + 60),
		'uncollected',
	);
	for (const missing of [NaN, 0, 1, -1, 1.5, Infinity]) {
		assert.equal(dailyRewardState(missing, missing, cycle), 'unknown');
	}
});

void test('account reward reads are bounded to owned players; missing cycles and failed reads stay unknown', async () => {
	const originals = [
		prisma.globalStorage.findUnique,
		prisma.playerStorage.findMany,
		prisma.dailyRewardHistory.groupBy,
	] as const;
	const cycle = 1_789_400_000;
	let queries = 0;
	try {
		prisma.globalStorage.findUnique = (async () => {
			queries++;
			return { value: String(cycle) };
		}) as unknown as typeof prisma.globalStorage.findUnique;
		prisma.playerStorage.findMany = (async (query: unknown) => {
			queries++;
			assert.deepEqual(query, {
				where: { player_id: { in: [10, 20, 30] }, key: 13412 },
				select: { player_id: true, value: true },
			});
			return [{ player_id: 10, value: cycle }];
		}) as typeof prisma.playerStorage.findMany;
		prisma.dailyRewardHistory.groupBy = (async (query: unknown) => {
			queries++;
			assert.deepEqual(query, {
				by: ['player_id'],
				where: {
					player_id: { in: [10, 20, 30] },
					timestamp: { gte: cycle },
					description: { startsWith: 'Claimed reward no.' },
				},
				_max: { timestamp: true },
			});
			return [{ player_id: 20, _max: { timestamp: cycle + 30 } }];
		}) as unknown as typeof prisma.dailyRewardHistory.groupBy;
		assert.deepEqual(
			[...(await loadAccountRewardStates([10, 20, 30]))],
			[
				[10, 'collected'],
				[20, 'collected'],
				[30, 'uncollected'],
			],
		);
		assert.equal(queries, 3);
		assert.equal((await loadAccountRewardStates([])).size, 0);
		assert.equal(queries, 3);
		prisma.globalStorage.findUnique = (async () =>
			null) as typeof prisma.globalStorage.findUnique;
		assert.equal((await loadAccountRewardStates([10])).size, 0);
		prisma.globalStorage.findUnique = (async () => {
			throw new Error('test database failure');
		}) as typeof prisma.globalStorage.findUnique;
		assert.equal((await loadAccountRewardStates([10])).size, 0);
	} finally {
		[
			prisma.globalStorage.findUnique,
			prisma.playerStorage.findMany,
			prisma.dailyRewardHistory.groupBy,
		] = originals;
	}
});
