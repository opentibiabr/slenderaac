import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import protobuf from 'protobufjs';

import { emptySlot } from '$lib/items';

import { createItemImageLoader, itemImageId } from './item-images';

// eslint-disable-next-line import/no-named-as-default-member -- Match the CommonJS SSR import.
const { parse: parseProtobuf } = protobuf;

const gif = Buffer.from(
	'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
	'base64',
);

void test('item requests accept native identities and inventory placeholders, without filesystem paths', () => {
	for (const id of ['empty', ...Object.values(emptySlot), '1', '4294967295'])
		assert.equal(itemImageId(id), id);
	assert.equal(itemImageId('0001'), '1');
	for (const invalid of [
		null,
		'',
		'0',
		'-1',
		'1.5',
		'1e3',
		'4294967296',
		'../outside',
		'..\\outside',
		'C:\\outside',
		'%2e%2e%2foutside',
		'empty.gif',
	])
		assert.equal(itemImageId(invalid), null);
});

void test('optional images survive absent or invalid metadata and refresh after installation or replacement', async () => {
	const fixture = await fs.mkdtemp(path.join(os.tmpdir(), 'slender-items-'));
	try {
		const images = path.join(fixture, 'images');
		const metadata = {
			data: path.join(fixture, 'appearances.dat'),
			proto: path.join(fixture, 'appearances.proto'),
		};
		const load = createItemImageLoader(images, metadata);
		assert.equal(await load('1'), null);
		await fs.mkdir(images);
		await fs.writeFile(path.join(images, '1.gif'), gif);
		await fs.writeFile(path.join(images, 'empty.gif'), gif);
		assert.equal(
			(await load('1'))?.src,
			`data:image/gif;base64,${gif.toString('base64')}`,
		);
		assert.equal((await load('1'))?.alt, '');
		assert.equal((await load('empty'))?.alt, '');

		const schema =
			'syntax = "proto2"; message Object {optional uint32 id = 1; optional string name = 2;} message Appearances {repeated Object object = 1;}';
		await fs.writeFile(metadata.proto, schema);
		const type = parseProtobuf(schema).root.lookupType('Appearances');
		const saveName = (name: string) =>
			fs.writeFile(
				metadata.data,
				type.encode({ object: [{ id: 1, name }] }).finish(),
			);
		await saveName('Sword');
		assert.equal((await load('1'))?.alt, 'Sword');
		await saveName('New sword name');
		assert.equal((await load('1'))?.alt, 'New sword name');
		await fs.writeFile(metadata.data, 'malformed metadata');
		assert.equal((await load('1'))?.alt, '');
		await saveName('Restored sword name');
		assert.equal((await load('1'))?.alt, 'Restored sword name');

		await fs.writeFile(path.join(images, '1.gif'), 'not an image');
		assert.equal(await load('1'), null);
		await fs.writeFile(path.join(images, '1.gif'), gif);
		assert.ok((await load('1'))?.src);
		await fs.writeFile(path.join(fixture, 'outside.gif'), gif);
		assert.equal(await load('../outside'), null);
		await fs.symlink(
			path.join(fixture, 'outside.gif'),
			path.join(images, '2.gif'),
			'file',
		);
		assert.equal(await load('2'), null);
		await fs.mkdir(path.join(images, '3.gif'));
		assert.equal(await load('3'), null);
	} finally {
		assert.equal(
			path.dirname(path.resolve(fixture)),
			path.resolve(os.tmpdir()),
		);
		assert.ok(path.basename(fixture).startsWith('slender-items-'));
		await fs.rm(fixture, { recursive: true, force: true });
	}
});
