import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { parseByteRange, rangedFileResponse } from './file-response';
import { loadSoundtrackCatalog } from './soundtrack';

async function soundtrackFixture() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'slender-soundtrack-'));
	await fs.mkdir(path.join(root, 'audio'));
	await fs.mkdir(path.join(root, 'images'));
	await fs.writeFile(path.join(root, 'audio', 'theme.mp3'), '0123456789');
	await fs.writeFile(path.join(root, 'images', 'theme.jpg'), 'image');
	await fs.writeFile(path.join(root, 'soundtrack.zip'), 'archive');
	await fs.writeFile(
		path.join(root, 'manifest.json'),
		JSON.stringify({
			version: 1,
			archive: 'soundtrack.zip',
			tracks: [
				{
					id: 'main-theme',
					title: 'Main Theme',
					audio: 'audio/theme.mp3',
					image: 'images/theme.jpg',
				},
			],
		}),
	);
	return root;
}

void test('soundtrack loads local tracks and optional archive metadata', async () => {
	const root = await soundtrackFixture();
	try {
		const catalog = await loadSoundtrackCatalog(root);
		assert.ok(catalog);
		assert.equal(catalog.tracks[0].id, 'main-theme');
		assert.equal(catalog.tracks[0].audio?.contentType, 'audio/mpeg');
		assert.equal(catalog.tracks[0].image?.contentType, 'image/jpeg');
		assert.equal(catalog.archive?.contentType, 'application/zip');
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
});

void test('soundtrack keeps missing optional media local and rejects unsafe manifests', async () => {
	const root = await soundtrackFixture();
	try {
		await fs.unlink(path.join(root, 'images', 'theme.jpg'));
		await fs.unlink(path.join(root, 'soundtrack.zip'));
		const catalog = await loadSoundtrackCatalog(root);
		assert.ok(catalog);
		assert.equal(catalog.tracks[0].image, null);
		assert.equal(catalog.archive, null);

		await fs.writeFile(
			path.join(root, 'manifest.json'),
			JSON.stringify({
				version: 1,
				tracks: [{ id: 'escape', title: 'Escape', audio: '../outside.mp3' }],
			}),
		);
		const invalid = await loadSoundtrackCatalog(root);
		assert.ok(invalid);
		assert.equal(invalid.tracks[0].audio, null);

		await fs.writeFile(
			path.join(root, 'manifest.json'),
			JSON.stringify({
				version: 1,
				tracks: [
					{ id: 'duplicate', title: 'One', audio: 'audio/theme.mp3' },
					{ id: 'duplicate', title: 'Two', audio: 'audio/theme.mp3' },
				],
			}),
		);
		assert.equal(await loadSoundtrackCatalog(root), null);
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
});

void test('soundtrack byte ranges cover open, bounded and suffix requests', () => {
	assert.deepEqual(parseByteRange('bytes=2-5', 10), { start: 2, end: 5 });
	assert.deepEqual(parseByteRange('bytes=7-', 10), { start: 7, end: 9 });
	assert.deepEqual(parseByteRange('bytes=-3', 10), { start: 7, end: 9 });
	assert.equal(parseByteRange('bytes=10-', 10), null);
	assert.equal(parseByteRange('bytes=5-2', 10), null);
	assert.equal(parseByteRange('bytes=0-1,4-5', 10), null);
});

void test('soundtrack responses stream ranges and reject unsatisfiable requests', async () => {
	const root = await soundtrackFixture();
	try {
		const catalog = await loadSoundtrackCatalog(root);
		const file = catalog?.tracks[0].audio;
		assert.ok(file);
		const partial = rangedFileResponse(
			new Request('http://localhost/media', {
				headers: { Range: 'bytes=2-5' },
			}),
			file,
		);
		assert.equal(partial.status, 206);
		assert.equal(partial.headers.get('Content-Range'), 'bytes 2-5/10');
		assert.equal(await partial.text(), '2345');
		const invalid = rangedFileResponse(
			new Request('http://localhost/media', {
				headers: { Range: 'bytes=20-' },
			}),
			file,
		);
		assert.equal(invalid.status, 416);
		assert.equal(invalid.headers.get('Content-Range'), 'bytes */10');
		const cached = rangedFileResponse(
			new Request('http://localhost/media', {
				headers: { 'If-None-Match': file.etag },
			}),
			file,
		);
		assert.equal(cached.status, 304);
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
});
