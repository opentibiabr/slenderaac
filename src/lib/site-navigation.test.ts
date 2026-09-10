import assert from 'node:assert/strict';
import { test } from 'node:test';

import { siteNavigation } from './site-navigation';

void test('built-in navigation exists without presentation data and keeps application links local', () => {
	const navigation = siteNavigation('Canary');
	const entries = Object.values(navigation).flat();
	assert.equal(entries.length, 52);
	assert.ok(
		entries.every(
			(entry) =>
				entry.label &&
				entry.href.startsWith('/') &&
				!entry.href.startsWith('//'),
		),
	);
	assert.equal(navigation.about[0].label, 'About Canary');
	assert.equal(navigation.support[1].label, 'Canary Rules');
	assert.equal(
		navigation.forum.at(-1)?.href,
		'/unavailable?feature=cmpostarchive',
	);
});

void test('native modules and configured downloads replace only their owned navigation destinations', () => {
	const navigation = siteNavigation(
		'Server',
		'https://downloads.example.org/client',
	);
	assert.equal(
		navigation.account.find((entry) => entry.label === 'Download Client')?.href,
		'https://downloads.example.org/client',
	);
	assert.equal(
		navigation.community.find((entry) => entry.label === 'Fansites')?.href,
		'/community/fansites',
	);
	assert.equal(
		navigation.community.find((entry) => entry.label === 'Resellers')?.href,
		'/community/resellers',
	);
	assert.equal(
		navigation.library.find((entry) => entry.label === 'Spells')?.href,
		'/library/spells',
	);
});
