import assert from 'node:assert/strict';
import { test } from 'node:test';

import { availableFeatureHref } from './site-pages';
import { referenceSiteDestination } from './source-navigation';
import { themePreviewHref } from './themes/preview';

void test('saved unavailable destinations upgrade without losing preview state or fragments', () => {
	const legacy = new URL(
		'https://game.example/unavailable?feature=experiencetable&themePreview=classic#levels',
	);
	assert.equal(
		availableFeatureHref(legacy, legacy.hash),
		'/library/experience-table?themePreview=classic#levels',
	);
	assert.equal(legacy.pathname, '/unavailable');
	assert.equal(
		themePreviewHref(
			new URL('https://game.example/?themePreview=classic'),
			'/unavailable?feature=experiencetable',
		),
		'/library/experience-table?themePreview=classic',
	);
	for (const feature of ['unknown', 'constructor', '__proto__'])
		assert.equal(
			availableFeatureHref(
				new URL(`https://game.example/unavailable?feature=${feature}`),
			),
			null,
		);
});

void test('server redirects do not read the browser-only fragment', () => {
	const url = new URL(
		'https://game.example/unavailable?feature=experiencetable&themePreview=classic',
	);
	Object.defineProperty(url, 'hash', {
		get() {
			throw new Error('Browser-only property');
		},
	});
	assert.equal(
		availableFeatureHref(url),
		'/library/experience-table?themePreview=classic',
	);
});

void test('native catalog links retain selection and filters while dropping unknown source parameters', () => {
	assert.equal(
		referenceSiteDestination(
			new URL('https://game.example/library/?subtopic=achievements#Grade+3'),
		),
		'/library/achievements#Grade+3',
	);
	assert.equal(
		themePreviewHref(
			new URL('https://game.example/?themePreview=classic'),
			'/unavailable?feature=achievements#Grade+3',
		),
		'/library/achievements?themePreview=classic#Grade+3',
	);
	const target = referenceSiteDestination(
		new URL(
			'https://game.example/library/?subtopic=spells&spell=healing&vocation=Mage&group=Healing&type=Instant&premium=yes&sort=mana&redirect=external#information',
		),
	);
	assert.equal(
		target,
		'/library/spells?spell=healing&vocation=Mage&group=Healing&type=Instant&premium=yes&sort=mana#information',
	);
	assert.equal(
		availableFeatureHref(
			new URL(
				'https://game.example/unavailable?feature=spells&themePreview=classic',
			),
		),
		'/library/spells?themePreview=classic',
	);
});
