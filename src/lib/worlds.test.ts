import assert from 'node:assert/strict';
import { test } from 'node:test';

import { availableFeatureHref, featureMenuHref } from './site-pages';
import { referenceSiteDestination } from './source-navigation';
import { worldSorting } from './worlds';

void test('world overview and detail destinations preserve context and upgrade only obsolete menu entries', () => {
	assert.equal(
		referenceSiteDestination(
			new URL(
				'https://reference.example/community/?subtopic=worlds&world=Canary&sort=level&order=desc#online-M',
			),
		),
		'/worlds?world=Canary&sort=level&order=desc#online-M',
	);
	assert.equal(
		featureMenuHref('community', 'Worlds', '/online?themePreview=classic'),
		'/worlds?themePreview=classic',
	);
	assert.equal(
		featureMenuHref('community', 'Who Is Online?', '/online'),
		'/online',
	);
	assert.equal(
		featureMenuHref('community', 'Worlds', '/custom-worlds'),
		'/custom-worlds',
	);
	assert.equal(
		availableFeatureHref(
			new URL('https://aac.example/unavailable?feature=worlds&world=Canary'),
		),
		'/worlds?world=Canary',
	);
});

void test('saved combined world sorting aliases retain both column and direction', () => {
	for (const sort of ['name', 'level', 'vocation'])
		for (const order of ['asc', 'desc'])
			assert.deepEqual(
				worldSorting(new URLSearchParams({ order: `${sort}_${order}` })),
				{ sort, order },
			);
	assert.deepEqual(
		worldSorting(new URLSearchParams({ sort: 'invalid', order: 'sideways' })),
		{ sort: 'name', order: 'asc' },
	);
});
