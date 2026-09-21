import assert from 'node:assert/strict';
import { test } from 'node:test';

import { experienceForLevel } from './experience';

void test('experience totals follow the server progression at starting and advanced levels', () => {
	for (const [level, expected] of [
		[1, 0n],
		[2, 100n],
		[3, 200n],
		[4, 400n],
		[5, 800n],
		[8, 4200n],
		[50, 1847300n],
		[875, 11089049800n],
		[3500, 713359324800n],
	] as const)
		assert.equal(experienceForLevel(level), expected, `level ${level}`);
	assert.ok(experienceForLevel(1000000) > BigInt(Number.MAX_SAFE_INTEGER));
	for (const level of [0, -1, 1.5, Infinity, NaN])
		assert.throws(() => experienceForLevel(level), RangeError);
});
