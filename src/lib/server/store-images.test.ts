import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { storeImage } from './store-images';

const png = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7XcAAAAASUVORK5CYII=',
	'base64',
);

void test('store images use external nested paths and revalidate replacements', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'slender-store-'));
	const request = new Request('http://localhost/images/store/13/category.png');
	try {
		assert.equal(
			(await storeImage(root, '13/category.png', request)).status,
			404,
		);
		await fs.mkdir(path.join(root, '13'));
		const file = path.join(root, '13/category.png');
		await fs.writeFile(file, png);
		const first = await storeImage(root, '13/category.png', request);
		assert.equal(first.status, 200);
		assert.equal(first.headers.get('Content-Type'), 'image/png');
		assert.deepEqual(Buffer.from(await first.arrayBuffer()), png);
		const etag = first.headers.get('ETag')!;
		const cached = new Request(request, {
			headers: { 'If-None-Match': `"other", W/${etag}` },
		});
		assert.equal(
			(await storeImage(root, '13/category.png', cached)).status,
			304,
		);
		const changed = Buffer.from(png);
		changed[25] ^= 1;
		await fs.writeFile(file, changed);
		assert.equal(
			(await storeImage(root, '13/category.png', cached)).status,
			200,
		);
		await fs.writeFile(file, 'invalid image');
		const invalid = await storeImage(root, '13/category.png', request);
		assert.equal(invalid.status, 404);
		assert.equal(invalid.headers.get('Cache-Control'), 'no-store');
		const catalogName = "13/Lamp_&_Ship's_Wheel_(Lit).png";
		await fs.writeFile(
			path.join(root, catalogName),
			Buffer.from(
				'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
				'base64',
			),
		);
		const gif = await storeImage(root, catalogName, request);
		assert.equal(gif.status, 200);
		assert.equal(gif.headers.get('Content-Type'), 'image/gif');
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
});

void test('store URLs cannot read private files, directories, or escaping symlinks', async () => {
	const fixture = await fs.mkdtemp(
		path.join(os.tmpdir(), 'slender-store-paths-'),
	);
	const root = path.join(fixture, 'images');
	try {
		await fs.mkdir(root);
		await fs.writeFile(path.join(fixture, 'outside.png'), png);
		await fs.symlink(
			path.join(fixture, 'outside.png'),
			path.join(root, 'link.png'),
		);
		await fs.mkdir(path.join(root, 'directory.png'));
		for (const name of [
			'../outside.png',
			'%252e%252e/outside.png',
			'link.png',
			'directory.png',
			'manifest.json',
			'.env',
			'image.svg',
			'/outside.png',
			'a\\b.png',
			'a:stream.png',
		]) {
			assert.equal(
				(await storeImage(root, name, new Request('http://localhost'))).status,
				404,
				name,
			);
		}
	} finally {
		await fs.rm(fixture, { recursive: true, force: true });
	}
});
