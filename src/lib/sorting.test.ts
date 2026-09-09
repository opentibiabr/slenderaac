import assert from 'node:assert/strict';
import { test } from 'node:test';

import { sortHref } from './sorting';

void test('sort links retain route, filters, preview and fragments without mutating the current URL', () => {
	const current = new URL(
		'https://server.invalid/online?world=North+Realm&themePreview=legbone&sort=name&order=asc#players',
	);
	const original = current.href;
	const link = new URL(sortHref(current, 'level', 'name', 'asc'), current);
	assert.equal(link.pathname, '/online');
	assert.equal(link.searchParams.get('world'), 'North Realm');
	assert.equal(link.searchParams.get('themePreview'), 'legbone');
	assert.equal(link.searchParams.get('sort'), 'level');
	assert.equal(link.searchParams.get('order'), 'asc');
	assert.equal(link.hash, '#players');
	assert.equal(current.href, original);
});

void test('repeated column selection toggles direction while another column starts ascending', () => {
	const url = new URL('https://server.invalid/online');
	assert.equal(
		new URL(sortHref(url, 'level', 'level', 'asc'), url).searchParams.get(
			'order',
		),
		'desc',
	);
	assert.equal(
		new URL(sortHref(url, 'level', 'level', 'desc'), url).searchParams.get(
			'order',
		),
		'asc',
	);
	assert.equal(
		new URL(sortHref(url, 'vocation', 'level', 'desc'), url).searchParams.get(
			'order',
		),
		'asc',
	);
});
