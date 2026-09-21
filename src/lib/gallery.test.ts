import assert from 'node:assert/strict';
import { test } from 'node:test';

import { adjacentScreenshot, dailyScreenshot } from './gallery';
import { parseInformationPresentation } from './information-content';

const items = [10, 42, 90].map((id) => ({
	id,
	thumbnail: `/theme-assets/classic/images/thumb-${id}.png`,
	src: `/theme-assets/classic/images/full-${id}.png`,
	caption: `Server screenshot ${id}`,
}));

function presentation(entries = items) {
	return {
		version: 1,
		id: 'screenshots',
		headline: {
			src: '/theme-assets/classic/images/screenshots.png',
			width: 200,
			height: 28,
		},
		body: [],
		gallery: {
			background: '/theme-assets/classic/images/background.png',
			items: entries,
		},
	};
}

void test('daily screenshot keeps image and destination together and rotates at UTC midnight', () => {
	assert.deepEqual(dailyScreenshot(items, 0), items[0]);
	assert.deepEqual(dailyScreenshot(items, 86_399_999), items[0]);
	assert.deepEqual(dailyScreenshot(items, 86_400_000), items[1]);
	assert.deepEqual(dailyScreenshot(items, 3 * 86_400_000), items[0]);
	assert.equal(dailyScreenshot([], 0), null);
});

void test('gallery edits preserve stable links and previous/next follows the published order', () => {
	assert.deepEqual(
		parseInformationPresentation(presentation(), 'screenshots')?.gallery?.items,
		items,
	);
	const remaining = [items[2], items[0]];
	assert.ok(
		parseInformationPresentation(presentation(remaining), 'screenshots'),
	);
	assert.equal(adjacentScreenshot(remaining, 90, 1)?.id, 10);
	assert.equal(adjacentScreenshot(remaining, 10, 1)?.id, 90);
	assert.equal(adjacentScreenshot(remaining, 90, -1)?.id, 10);
	assert.equal(adjacentScreenshot(remaining, 42, 1), null);
	assert.equal(adjacentScreenshot([items[0]], 10, -1)?.id, 10);
	assert.equal(adjacentScreenshot([], 10, 1), null);
	assert.ok(parseInformationPresentation(presentation([]), 'screenshots'));
});

void test('gallery validation rejects ambiguous IDs and nonlocal artwork', () => {
	for (const entries of [
		[items[0], items[0]],
		[{ ...items[0], id: 0 }],
		[{ ...items[0], id: -1 }],
		[{ ...items[0], id: 1.5 }],
		[{ ...items[0], src: 'https://example.org/unrelated.png' }],
	]) {
		assert.equal(
			parseInformationPresentation(presentation(entries), 'screenshots'),
			null,
		);
	}
});
