import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { loadMapCatalog, mapPlaces } from './maps';

async function mapFixture() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'slender-maps-'));
	await fs.mkdir(path.join(root, 'images'));
	await fs.writeFile(path.join(root, 'images', 'world.jpg'), 'world');
	await fs.writeFile(path.join(root, 'images', 'capital.png'), 'capital');
	await fs.writeFile(
		path.join(root, 'manifest.json'),
		JSON.stringify({
			version: 1,
			overview: 'images/world.jpg',
			highResolution: 'images/world.jpg',
			sections: [
				{
					title: 'Main Continent',
					groups: [
						{
							label: 'Cities',
							places: [
								{
									id: 'capital',
									name: 'Capital',
									description: 'The main city.',
									x: 50,
									y: 40,
									image: 'images/capital.png',
								},
							],
						},
					],
				},
			],
		}),
	);
	return root;
}

void test('maps load local overview, areas and high-resolution media', async () => {
	const root = await mapFixture();
	try {
		const catalog = await loadMapCatalog(root);
		assert.ok(catalog);
		assert.equal(catalog.overview?.contentType, 'image/jpeg');
		assert.equal(catalog.highResolution?.contentType, 'image/jpeg');
		assert.deepEqual(
			mapPlaces(catalog).map(({ id, name, x, y, image }) => ({
				id,
				name,
				x,
				y,
				type: image?.contentType,
			})),
			[
				{
					id: 'capital',
					name: 'Capital',
					x: 50,
					y: 40,
					type: 'image/png',
				},
			],
		);
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
});

void test('maps preserve missing media states and reject invalid identities or coordinates', async () => {
	const root = await mapFixture();
	try {
		await fs.unlink(path.join(root, 'images', 'capital.png'));
		const catalog = await loadMapCatalog(root);
		assert.ok(catalog);
		assert.equal(mapPlaces(catalog)[0].image, null);

		const invalidManifest = (place: Record<string, unknown>) => ({
			version: 1,
			overview: 'images/world.jpg',
			sections: [
				{
					title: 'Region',
					groups: [{ places: [place] }],
				},
			],
		});
		for (const place of [
			{ id: '../escape', name: 'Escape' },
			{ id: 'outside', name: 'Outside', x: 101, y: 50 },
			{ id: 'incomplete', name: 'Incomplete', x: 10 },
		]) {
			await fs.writeFile(
				path.join(root, 'manifest.json'),
				JSON.stringify(invalidManifest(place)),
			);
			assert.equal(await loadMapCatalog(root), null);
		}
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
});
