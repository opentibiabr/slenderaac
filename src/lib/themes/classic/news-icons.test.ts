import assert from 'node:assert/strict';
import { test } from 'node:test';

import { classicNewsCategories, classicNewsIcon } from './news-icons';

void test('headline, ticker and archive follow the current category', () => {
	const assets = Object.fromEntries(
		classicNewsCategories.map(({ iconKey, key }) => [iconKey, `${key}-small`]),
	);
	for (const { key } of classicNewsCategories) {
		assert.equal(classicNewsIcon(assets, key), `${key}-small`);
		assert.equal(classicNewsIcon(assets, key, true), `${key}-small`);
	}
	assert.equal(classicNewsIcon(assets, 'unknown'), 'community-small');
});

void test('captured development defaults cannot mislabel another category', () => {
	const assets = {
		newsHeadlineIcon: 'old-development-big',
		newsHeadlineIconCommunity: 'community-big',
		newsArchiveIconSupport: 'support-small',
	};
	assert.equal(
		classicNewsIcon(assets, 'development', true),
		'old-development-big',
	);
	assert.equal(classicNewsIcon(assets, 'community', true), 'community-big');
	assert.equal(classicNewsIcon(assets, 'support', true), 'support-small');
	assert.equal(classicNewsIcon(assets, 'technical', true), null);
	assert.equal(classicNewsIcon(null, 'community', true), null);
});
