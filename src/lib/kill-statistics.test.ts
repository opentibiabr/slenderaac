import assert from 'node:assert/strict';
import { test } from 'node:test';

import { collectionCoverage, killWindow } from './kill-statistics';

void test('rolling windows exclude the current partial minute', () => {
	assert.deepEqual(killWindow(2_000_000_059), {
		end: 33333334,
		day: 33331894,
		week: 33323254,
	});
});

void test('a new, missing or stopped collector is never a complete week', () => {
	const now = 2_000_000_000;
	assert.equal(collectionCoverage([], now).partial, true);
	assert.equal(collectionCoverage([], now).stale, true);
	assert.equal(
		collectionCoverage(
			[{ started_at: now - 3600, updated_at: now, dropped_events: 0 }],
			now,
		).partial,
		true,
	);
	assert.equal(
		collectionCoverage(
			[{ started_at: now - 700000, updated_at: now - 180, dropped_events: 0 }],
			now,
		).stale,
		true,
	);
});

void test('continuous overlapping collectors cover a week without concealing gaps', () => {
	const now = 2_000_000_000;
	const intervals = [
		{ started_at: now - 700000, updated_at: now - 1000, dropped_events: 0 },
		{ started_at: now - 1001, updated_at: now, dropped_events: 0 },
	];
	assert.equal(collectionCoverage(intervals, now).partial, false);
	intervals[1].started_at = now - 999;
	assert.equal(collectionCoverage(intervals, now).partial, true);
	intervals[1].started_at = now - 1001;
	intervals[1].dropped_events = 1;
	assert.equal(collectionCoverage(intervals, now).partial, true);
});
