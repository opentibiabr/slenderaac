import assert from 'node:assert/strict';
import { test } from 'node:test';

import { onlineRecord, parseWorldConfig, worldHref } from '$lib/worlds';

import { importWorldConfig } from './world-import';

void test('only allowlisted literal world settings leave the server configuration', () => {
	const world = importWorldConfig(`
		serverName = "Canary"
		location = "South America"
		worldType = "retro-pvp"
		maxPlayers = 0
		mysqlPass = "private fixture"
		unknownSetting = os.getenv("PRIVATE_SETTING")
	`);
	assert.deepEqual(world, {
		name: 'Canary',
		location: 'South America',
		pvpType: 'retro-pvp',
		maxPlayers: 0,
	});
	assert.deepEqual(parseWorldConfig({ ...world, password: 'excluded' }), world);
	assert.deepEqual(importWorldConfig('-- no public metadata'), {});
	assert.deepEqual(importWorldConfig('worldType = "PVP"'), { pvpType: 'pvp' });
	for (const source of [
		'serverName = os.getenv("NAME")',
		'worldType = "pvp"\nif condition then worldType = "no-pvp" end',
		'maxPlayers = -1',
		'worldType = "unknown"',
		'location = ""',
	])
		assert.throws(() => importWorldConfig(source));
	for (const value of [
		null,
		[],
		{ name: 'line\nbreak' },
		{ maxPlayers: Number.MAX_SAFE_INTEGER + 1 },
	])
		assert.throws(() => parseWorldConfig(value));
});

void test('native online records keep zero and reject missing or corrupt values', () => {
	assert.equal(onlineRecord('0'), 0);
	assert.equal(onlineRecord('256'), 256);
	for (const value of [undefined, '', '-1', '3.1', '1e4', '9007199254740992'])
		assert.equal(onlineRecord(value), null);
	assert.equal(
		new URL(worldHref('A&B / Realm'), 'https://aac.example').searchParams.get(
			'world',
		),
		'A&B / Realm',
	);
});
