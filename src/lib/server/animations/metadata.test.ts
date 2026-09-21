import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { mountOutfitId } from './config';
import { animationFrameCount, loadData } from './metadata';

void test('sprite lookup tolerates absent packs and indexes complete animations without writing cache files', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'slender-sprites-'));
	try {
		assert.equal(loadData(128, root), null);
		assert.equal(loadData(-1, root), null);
		const directory = path.join(root, '128');
		await fs.mkdir(directory);
		for (let frame = 1; frame <= 12; frame++)
			await fs.writeFile(path.join(directory, `${frame}_1_1_3.png`), 'fixture');
		await fs.writeFile(path.join(directory, '1_2_1_3.png'), 'mounted');
		await fs.writeFile(
			path.join(directory, '1_1_1_3_template.png'),
			'template',
		);
		await fs.writeFile(path.join(directory, 'ignored.txt'), 'not an image');
		assert.equal(loadData(128, root)?.framesNumber, 12);
		assert.equal(loadData(128, root, { mounted: true })?.framesNumber, 1);
		assert.equal(loadData(128, root, { direction: 1 }), null);
		assert.equal(loadData(128, root)?.files.length, 14);
		assert.equal(
			(await fs.readdir(directory)).includes('outfit.data.json'),
			false,
		);
		await fs.rm(path.join(directory, '2_1_1_3.png'));
		await fs.utimes(directory, new Date(), new Date(Date.now() + 1000));
		assert.throws(() => loadData(128, root), /missing frames/);
	} finally {
		assert.ok(path.relative(os.tmpdir(), root).startsWith('slender-sprites-'));
		await fs.rm(root, { recursive: true, force: true });
	}
});

void test('registered mount numbers, direct outfit IDs and existing flagged IDs resolve consistently', () => {
	assert.equal(mountOutfitId(1), 368);
	assert.equal(mountOutfitId(368), 368);
	assert.equal(mountOutfitId(0x10000 | 368), 368);
	assert.equal(mountOutfitId(0), 0);
	assert.equal(mountOutfitId(-1), 0);
	assert.equal(mountOutfitId(Number.NaN), 0);
});

void test('a mounted animation includes both complete loops, including a stationary rider', () => {
	assert.equal(animationFrameCount(1, 8), 8);
	assert.equal(animationFrameCount(8, 1), 8);
	assert.equal(animationFrameCount(8, 10), 40);
	assert.equal(animationFrameCount(12), 12);
	assert.throws(() => animationFrameCount(127, 128), /frame limit/);
});
