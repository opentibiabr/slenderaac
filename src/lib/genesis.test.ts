import assert from 'node:assert/strict';
import { test } from 'node:test';

import { romanNumeral, storyChapters, storyPage } from './genesis';

const chapter = (slug: string, order: number) => ({
	slug,
	order,
	title: slug,
	content: `${slug} content`,
});

void test('story chapters reuse only reserved static pages in publisher order', () => {
	assert.deepEqual(
		storyChapters([
			chapter('rules', 0),
			chapter('genesis-draft', 1),
			chapter('genesis-10', 3),
			chapter('genesis-2', 2),
			chapter('genesis-1', 2),
		]).map(({ slug }) => slug),
		['genesis-1', 'genesis-2', 'genesis-10'],
	);
});

void test('story page selection is strict and keeps an honest empty state', () => {
	assert.equal(storyPage(null, 3), 0);
	assert.equal(storyPage('3', 3), 2);
	for (const value of ['0', '-1', '2.5', '4', 'chapter'])
		assert.equal(storyPage(value, 3), null);
	assert.equal(storyPage(null, 0), 0);
	assert.equal(storyPage('1', 0), 0);
	assert.equal(storyPage('2', 0), null);
});

void test('chapter labels use readable roman numerals with a bounded fallback', () => {
	assert.equal(romanNumeral(1), 'I');
	assert.equal(romanNumeral(14), 'XIV');
	assert.equal(romanNumeral(4000), '4000');
});
