import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { fankitDownloadHeaders, loadFankitPackage } from './fankit';
import { fileNotModified } from './file-response';

void test('fankit metadata and download headers follow the configured ZIP', async () => {
	const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'slender-fankit-'));
	const archivePath = path.join(directory, 'Server Media 2026.zip');
	try {
		await fs.writeFile(archivePath, Buffer.from('PK\x03\x04fixture'));
		const file = await loadFankitPackage(archivePath);
		assert.ok(file);
		assert.equal(file.name, 'Server Media 2026.zip');
		assert.equal(file.size, 11);
		const headers = fankitDownloadHeaders(file);
		assert.equal(headers.get('Content-Type'), 'application/zip');
		assert.equal(headers.get('Content-Length'), '11');
		assert.match(
			headers.get('Content-Disposition') ?? '',
			/filename\*=UTF-8''Server%20Media%202026\.zip/,
		);
		assert.equal(
			fileNotModified(
				new Request('http://localhost/fankit/download', {
					headers: { 'If-None-Match': `"older", ${file.etag}` },
				}),
				file,
			),
			true,
		);
		assert.equal(
			fileNotModified(
				new Request('http://localhost/fankit/download', {
					headers: { 'If-Modified-Since': file.modified.toUTCString() },
				}),
				file,
			),
			true,
		);
	} finally {
		await fs.rm(directory, { recursive: true, force: true });
	}
});

void test('fankit rejects absent, relative, empty, linked and non-ZIP files', async () => {
	const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'slender-fankit-'));
	try {
		const empty = path.join(directory, 'empty.zip');
		const image = path.join(directory, 'art.png');
		const archive = path.join(directory, 'media.zip');
		const link = path.join(directory, 'linked.zip');
		await fs.writeFile(empty, '');
		await fs.writeFile(image, 'image');
		await fs.writeFile(archive, 'archive');
		await fs.symlink(archive, link);

		for (const candidate of [
			'',
			'relative.zip',
			path.join(directory, 'missing.zip'),
			empty,
			image,
			link,
		])
			assert.equal(await loadFankitPackage(candidate), null, candidate);
	} finally {
		await fs.rm(directory, { recursive: true, force: true });
	}
});
