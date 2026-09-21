import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	selectedAchievements,
	showcaseSelection,
} from './achievement-showcase';

const earned = [1, 2, 3, 4, 5, 6].map((id) => ({
	id,
	name: `Achievement ${id}`,
	description: 'Earned in the game.',
	grade: 1,
	points: 1,
	secret: id === 2,
}));

void test('the owner can select up to five earned achievements or clear the showcase', () => {
	assert.deepEqual(showcaseSelection(['2', '1'], earned), [2, 1]);
	assert.deepEqual(showcaseSelection([], earned), []);
	assert.deepEqual(
		showcaseSelection(['1', '2', '3', '4', '5'], earned),
		[1, 2, 3, 4, 5],
	);
	for (const values of [
		['1', '1'],
		['7'],
		['01'],
		['-1'],
		['1.5'],
		[1],
		['1', '2', '3', '4', '5', '6'],
	])
		assert.equal(showcaseSelection(values, earned), null);
});

void test('public showcases expose only selected achievements that remain earned', () => {
	assert.deepEqual(
		selectedAchievements([2, 1, 2, 7], earned).map((entry) => entry.id),
		[2, 1],
	);
	assert.deepEqual(
		selectedAchievements(
			[2, 1],
			earned.filter((entry) => entry.id !== 2),
		).map((entry) => entry.id),
		[1],
	);
	assert.deepEqual(selectedAchievements([], earned), []);
	assert.equal(selectedAchievements([1, 2, 3, 4, 5, 6], earned).length, 5);
});
