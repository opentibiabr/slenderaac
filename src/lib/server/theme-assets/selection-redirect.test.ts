import assert from 'node:assert/strict';
import { test } from 'node:test';

import { preserveLayoutSelectionRedirect } from './selection-redirect';

const current = (path: string) => new URL(path, 'https://example.test');

void test('carries a transient layout request through an intermediate redirect', async () => {
	const response = await preserveLayoutSelectionRedirect(
		new Response(null, {
			status: 303,
			headers: { location: '/account/login?returnTo=%2Faccount' },
		}),
		current('/account?layout=classic'),
		false,
	);

	assert.equal(response.status, 303);
	assert.equal(
		response.headers.get('location'),
		'/account/login?returnTo=%2Faccount&layout=classic',
	);
});

void test('does not rewrite the canonical redirect that consumes layout state', async () => {
	const response = new Response(null, {
		status: 307,
		headers: { location: '/characters?search=Knight' },
	});
	const preserved = await preserveLayoutSelectionRedirect(
		response,
		current('/characters?layout=classic&search=Knight'),
		false,
	);

	assert.equal(preserved, response);
	assert.equal(preserved.headers.get('location'), '/characters?search=Knight');
});

void test('rewrites serialized SvelteKit redirects without stale entity headers', async () => {
	const response = await preserveLayoutSelectionRedirect(
		new Response(JSON.stringify({ type: 'redirect', location: '/account' }), {
			status: 200,
			headers: {
				'content-type': 'application/json',
				'content-length': '49',
				etag: 'stale',
			},
		}),
		current('/account/login?themePreview=legbone'),
		true,
	);

	assert.deepEqual(await response.json(), {
		type: 'redirect',
		location: '/account?themePreview=legbone',
	});
	assert.equal(response.headers.has('content-length'), false);
	assert.equal(response.headers.has('etag'), false);
});

void test('leaves ordinary responses and external redirects untouched', async () => {
	const ordinary = new Response('ok');
	assert.equal(
		await preserveLayoutSelectionRedirect(
			ordinary,
			current('/?layout=classic'),
			false,
		),
		ordinary,
	);

	const external = new Response(null, {
		status: 302,
		headers: { location: 'https://outside.test/path' },
	});
	assert.equal(
		await preserveLayoutSelectionRedirect(
			external,
			current('/?layout=classic'),
			false,
		),
		external,
	);
});
