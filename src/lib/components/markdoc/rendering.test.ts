import assert from 'node:assert/strict';
import { test } from 'node:test';

import { markdocAttributes } from './rendering';

const page = new URL(
	'https://game.example/support/parents-guide?classicReference=1',
);
const identity = { name: 'Canary & Friends', website: page.origin };

void test('Markdoc preserves section anchors and rewrites supported internal links', () => {
	assert.deepEqual(
		markdocAttributes(
			'h3',
			{ id: 'introduction', title: 'About {{serverName}}' },
			page,
			identity,
		),
		{ id: 'introduction', title: 'About Canary & Friends' },
	);
	assert.deepEqual(
		markdocAttributes('a', { href: '#introduction' }, page, identity),
		{ href: '/support/parents-guide?classicReference=1#introduction' },
	);
	assert.deepEqual(
		markdocAttributes(
			'a',
			{ href: '/unavailable?feature=gethelp#articles' },
			page,
			identity,
		),
		{ href: '/support/get-help?classicReference=1#articles' },
	);
});

void test('Markdoc retains explicit attributes for images, lists, tables, and code', () => {
	assert.deepEqual(
		markdocAttributes(
			'img',
			{
				src: '/badge.png',
				alt: '{{serverName}}',
				title: 'Visit {{serverWebsite}}',
				href: '/download',
				style: 'color: red',
			},
			page,
			identity,
		),
		{
			src: '/badge.png',
			alt: 'Canary & Friends',
			title: 'Visit https://game.example',
		},
	);
	assert.deepEqual(markdocAttributes('ol', { start: 2 }, page, identity), {
		start: '2',
	});
	assert.deepEqual(
		markdocAttributes('td', { align: 'right', colSpan: 2 }, page, identity),
		{ align: 'right', colSpan: '2' },
	);
	assert.deepEqual(
		markdocAttributes('pre', { 'data-language': 'text' }, page, identity),
		{ 'data-language': 'text' },
	);
});

void test('Markdoc filters elements and URLs outside its display policy', () => {
	assert.equal(markdocAttributes('section', {}, page, identity), undefined);
	assert.deepEqual(
		markdocAttributes(
			'a',
			{ href: 'ftp://game.example/manual' },
			page,
			identity,
		),
		{},
	);
	assert.deepEqual(
		markdocAttributes(
			'img',
			{ src: 'mailto:support@example.com', alt: 'Support' },
			page,
			identity,
		),
		{ alt: 'Support' },
	);
	assert.deepEqual(
		markdocAttributes(
			'a',
			{ href: 'mailto:support@example.com' },
			page,
			identity,
		),
		{ href: 'mailto:support@example.com' },
	);
});
