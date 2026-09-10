import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	directoryCountry,
	directoryDetails,
	directoryEditorValues,
	directoryFilterHref,
	directoryInput,
	type DirectoryRecord,
	directoryUrl,
	filterFansites,
} from './directories';

const form = (values: Record<string, string | string[]>) => {
	const data = new FormData();
	for (const [key, value] of Object.entries(values))
		for (const item of Array.isArray(value) ? value : [value])
			data.append(key, item);
	return data;
};

void test('partner URLs allow websites without credentials or executable schemes', () => {
	assert.equal(
		directoryUrl('https://example.org/partner?q=1'),
		'https://example.org/partner?q=1',
	);
	for (const url of [
		'javascript:alert(1)',
		'data:text/html,hello',
		'//example.org',
		'https://user:pass@example.org',
		'invalid',
	])
		assert.equal(directoryUrl(url), null);
});

void test('directory metadata validates supported classifications and asset keys', () => {
	assert.deepEqual(
		directoryDetails({ languages: ['en', 'en', 'pt'] }).languages,
		['en', 'pt'],
	);
	assert.equal(directoryCountry('BR'), 'Brazil');
	for (const code of ['br', 'ZZ', '<script>', 'AA'])
		assert.equal(directoryCountry(code), null);
	for (const details of [
		null,
		[],
		{ languages: ['unknown'] },
		{ socials: ['__proto__'] },
		{ content: ['constructor'] },
		{ logoAsset: '../outside.png' },
		{ itemAsset: 'https://example.org' },
		{ email: 'not an email' },
	])
		assert.throws(() => directoryDetails(details));
});

void test('admin entries validate reseller countries and retain only appropriate flags', () => {
	const values = {
		name: 'Partner',
		kind: 'reseller',
		url: 'https://example.org',
		countries: 'br, US, BR',
		published: 'on',
		promoted: 'on',
		featured: 'on',
	};
	const entry = directoryInput(form(values));
	assert.deepEqual(entry?.details.countries, ['BR', 'US']);
	assert.equal(entry?.published, true);
	assert.equal(entry?.promoted, false);
	assert.equal(entry?.featured, false);
	for (const patch of [
		{ countries: '' },
		{ countries: 'ZZ' },
		{ name: '' },
		{ kind: 'other' },
		{ url: 'javascript:alert(1)' },
	])
		assert.equal(directoryInput(form({ ...values, ...patch })), null);
	assert.equal(
		directoryInput(
			form({
				...values,
				kind: 'fansite',
				countries: '',
				languages: ['en', 'pt'],
			}),
		)?.featured,
		true,
	);
});

void test('filters combine alternatives within a group and intersect different groups', () => {
	const entry = (
		id: string,
		languages: string[],
		socials: string[],
		content: string[],
	): DirectoryRecord => ({
		id,
		name: id,
		kind: 'fansite',
		url: 'https://example.org',
		description: '',
		promoted: false,
		featured: false,
		contactExists: false,
		details: directoryDetails({ languages, socials, content }),
	});
	const entries = [
		entry('en-tools', ['en'], ['discord'], ['tools']),
		entry('pt-wiki', ['pt'], [], ['wiki']),
		entry('de-tools', ['de'], ['discord'], ['tools']),
	];
	assert.deepEqual(
		filterFansites(entries, new URLSearchParams('language=en&language=pt')).map(
			(e) => e.id,
		),
		['en-tools', 'pt-wiki'],
	);
	assert.deepEqual(
		filterFansites(
			entries,
			new URLSearchParams(
				'language=en&language=pt&content=tools&social=discord',
			),
		).map((e) => e.id),
		['en-tools'],
	);
	assert.equal(
		filterFansites(entries, new URLSearchParams('language=unknown')).length,
		0,
	);
});

void test('filter toggles preserve the active layout and independent groups', () => {
	const url = new URL(
		'https://server.example/community/fansites?themePreview=classic&language=en&content=tools',
	);
	const added = new URL(directoryFilterHref(url, 'language', 'pt'), url);
	assert.deepEqual(added.searchParams.getAll('language'), ['en', 'pt']);
	assert.equal(added.searchParams.get('themePreview'), 'classic');
	const toggled = new URL(directoryFilterHref(added, 'language', 'en'), url);
	assert.deepEqual(toggled.searchParams.getAll('language'), ['pt']);
	const cleared = new URL(directoryFilterHref(toggled, 'language', ''), url);
	assert.equal(cleared.searchParams.has('language'), false);
	assert.equal(cleared.searchParams.get('content'), 'tools');
});

void test('failed editor input keeps checked values without retaining unbounded text', () => {
	const values = directoryEditorValues(
		form({
			name: 'x'.repeat(300),
			languages: ['en', 'pt'],
			content: ['tools'],
			published: 'on',
		}),
	);
	assert.equal(values.name.length, 255);
	assert.equal(values.languages, 'en,pt');
	assert.equal(values.content, 'tools');
	assert.equal(values.published, 'on');
});
