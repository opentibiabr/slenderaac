import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseAchievementRecords, publicAchievements } from './achievements';

void test('public achievement groups preserve native points without publishing secret identities', () => {
	const records = parseAchievementRecords([
		{
			id: 1,
			name: 'Public',
			description: 'Description',
			grade: 1,
			points: 2,
			secret: false,
		},
		{
			id: 2,
			name: 'Hidden identity',
			description: 'Hidden description',
			grade: 4,
			points: 11,
			secret: true,
		},
	]);
	const result = publicAchievements(records);
	assert.equal(result.groups.length, 4);
	assert.equal(result.groups[0].entries[0].points, 2);
	assert.equal(result.groups[3].maximumPoints, 11);
	assert.equal(result.groups[3].entries.length, 0);
	assert.equal(result.secretCount, 1);
	assert.ok(!JSON.stringify(result).includes('Hidden'));
	assert.throws(
		() => parseAchievementRecords([records[0], records[0]]),
		/duplicate/,
	);
	assert.throws(
		() => parseAchievementRecords([{ ...records[0], grade: 5 }]),
		/Invalid/,
	);
});
