import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fetchBackground, fetchItem, itemURL } from './items';

void test('item images tolerate missing files, malformed payloads and network failures', async () => {
	const original = globalThis.fetch;
	try {
		for (const response of [
			new Response('missing', { status: 404 }),
			Response.json({}),
			new Response('not json'),
		]) {
			globalThis.fetch = () => Promise.resolve(response);
			assert.deepEqual(await fetchItem(1234), { src: '', alt: 'Item 1234' });
		}
		globalThis.fetch = () => Promise.reject(new Error('offline'));
		assert.deepEqual(await fetchBackground(), { src: '', alt: '' });
		globalThis.fetch = () =>
			Promise.resolve(
				Response.json({ src: 'data:image/gif;base64,R0lGODlh', alt: 'sword' }),
			);
		assert.equal((await fetchItem(1234)).alt, 'sword');
		assert.equal(itemURL('a&b'), '/api/items?id=a%26b');
	} finally {
		globalThis.fetch = original;
	}
});
