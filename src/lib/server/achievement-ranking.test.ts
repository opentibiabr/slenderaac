import assert from 'node:assert/strict';
import { test } from 'node:test';

import { highscoreCategories } from '../highscores';
import { achievementPoints } from './achievement-points';
import {
	createAchievementPointCache,
	rankAchievementPlayers,
} from './achievement-ranking';
import { isSkill } from './skills';

void test('native achievement points distinguish absent, corrupt and valid scalar values', () => {
	assert.equal(achievementPoints(undefined), 0);
	assert.equal(achievementPoints(null), null);
	assert.equal(achievementPoints(Uint8Array.of(16, 137, 1)), 137);
	assert.equal(achievementPoints(Uint8Array.of(16, 255, 255, 3)), 65535);
	assert.equal(achievementPoints(Uint8Array.of(16, 128, 128, 4)), null);
	const double = new Uint8Array(9);
	double[0] = 25;
	new DataView(double.buffer).setFloat64(1, 42, true);
	assert.equal(achievementPoints(double), 42);
	for (const value of [-1, 1.5, Infinity, NaN]) {
		new DataView(double.buffer).setFloat64(1, value, true);
		assert.equal(achievementPoints(double), null);
	}
});

void test('rank native totals with stable ties, include missing zeros and exclude corrupt totals', () => {
	assert.deepEqual(
		rankAchievementPlayers(
			[4, 3, 2, 1, 5],
			new Map([
				[1, 10],
				[2, 137],
				[3, 10],
				[5, null],
				[99, 65535],
			]),
		),
		[
			{ playerId: 2, points: 137 },
			{ playerId: 1, points: 10 },
			{ playerId: 3, points: 10 },
			{ playerId: 4, points: 0 },
		],
	);
	assert.ok(
		highscoreCategories.every(
			({ value }) => value === 'achievements' || isSkill(value),
		),
	);
	assert.equal(
		new Set(highscoreCategories.map(({ value }) => value)).size,
		highscoreCategories.length,
	);
});

void test('point refresh batches indexed keys and only accepts canonical native scopes', async () => {
	const afterValues: string[] = [];
	const read = createAchievementPointCache((after) => {
		afterValues.push(after);
		return Promise.resolve(
			after === ''
				? Array.from({ length: 1000 }, (_, index) => ({
						key_name: `player.${10000 + index}.achievements.points`,
						value: Uint8Array.of(16, 10),
					}))
				: [
						{ key_name: 'player.11000.achievements.points', value: null },
						{
							key_name: 'player.011001.achievements.points',
							value: Uint8Array.of(16, 1),
						},
						{
							key_name: 'player.11002.extra.achievements.points',
							value: Uint8Array.of(16, 1),
						},
					],
		);
	});
	const points = await read();
	assert.deepEqual(afterValues, ['', 'player.10999.achievements.points']);
	assert.equal(points.size, 1001);
	assert.equal(points.get(11000), null);
});

void test('simultaneous reads share refresh, expired failures reject and later refresh recovers', async () => {
	let now = 0,
		reads = 0,
		fail = false;
	const read = createAchievementPointCache(
		() => {
			reads += 1;
			if (fail) return Promise.reject(new Error('read failed'));
			return Promise.resolve([
				{
					key_name: 'player.7.achievements.points',
					value: Uint8Array.of(16, reads),
				},
			]);
		},
		() => now,
	);
	const [first, second] = await Promise.all([read(), read()]);
	assert.equal(first, second);
	assert.equal(reads, 1);
	now = 29_999;
	assert.equal(await read(), first);
	assert.equal(reads, 1);
	now = 30_000;
	fail = true;
	await assert.rejects(read(), /read failed/);
	fail = false;
	assert.equal((await read()).get(7), 3);
	assert.equal(reads, 3);
});
