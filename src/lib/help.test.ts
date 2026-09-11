import assert from 'node:assert/strict';
import { test } from 'node:test';

import { helpEntryInput, helpQuery } from './help';
import { referenceSiteDestination } from './source-navigation';
import { themePreviewHref } from './themes/preview';

void test('help queries reject malformed selection and keep bounded search pagination', () => {
	for (const query of [
		'topic=missing',
		'article=../secret',
		'page=0',
		'page=1.5',
		'page=10000',
		'q=' + 'x'.repeat(51),
	])
		assert.equal(helpQuery(new URLSearchParams(query)), null);
	assert.deepEqual(
		helpQuery(new URLSearchParams('q=  account   safe &topic=account&page=2')),
		{ topic: 'account', article: '', query: 'account safe', page: 2 },
	);
});
void test('FAQ publication requires complete bounded input and preserves checkbox state', () => {
	const form = new FormData();
	for (const [key, value] of Object.entries({
		title: ' Test ',
		slug: 'test-article',
		topic: 'account',
		content: 'Local answer',
		published: 'on',
		featured: 'on',
	}))
		form.set(key, value);
	const result = helpEntryInput(form);
	assert.equal(result.valid, true);
	assert.equal(result.data.title, 'Test');
	assert.equal(result.data.published, true);
	assert.equal(result.values.featured, 'on');
	form.set('slug', '../bad');
	form.set('title', '');
	form.set('content', 'x'.repeat(20001));
	form.set('topic', 'unknown');
	assert.deepEqual(Object.keys(helpEntryInput(form).errors).sort(), [
		'content',
		'slug',
		'title',
		'topic',
	]);
	form.delete('published');
	assert.equal(helpEntryInput(form).data.published, false);
});
void test('saved unavailable support links upgrade locally in either theme', () => {
	for (const theme of ['classic', 'legbone']) {
		const url = new URL('https://aac.example/?themePreview=' + theme);
		for (const [feature, path] of Object.entries({
			gethelp: '/support/get-help',
		})) {
			const destination = new URL(
				themePreviewHref(url, '/unavailable?feature=' + feature),
				url,
			);
			assert.equal(destination.pathname, path);
			assert.equal(destination.origin, url.origin);
			assert.equal(destination.searchParams.get('themePreview'), theme);
		}
	}
});

void test('legacy help deep links retain a local category or article destination', () => {
	const base = 'https://example.invalid/support/?subtopic=gethelp';
	assert.equal(
		referenceSiteDestination(new URL(base + '&topicid=18')),
		'/support/get-help?topic=account',
	);
	assert.equal(
		referenceSiteDestination(new URL(base + '&entryid=51')),
		'/support/get-help?article=enable-authenticator',
	);
	assert.equal(
		referenceSiteDestination(new URL(base + '&entryid=999999')),
		'/support/get-help?article=legacy-entry-999999',
	);
});
