import assert from 'node:assert/strict';
import { test } from 'node:test';

import { activeBoostedSelection, boostedClientResponse } from './boosted';

const stored = {
	date: '13',
	boostname: 'Crystal Wolf',
	raceid: '321',
	looktype: 101,
	lookaddons: 0,
	lookhead: 0,
	lookbody: 0,
	looklegs: 0,
	lookfeet: 0,
	lookmount: 0,
};

void test('daily selections are exposed only for the current server day', () => {
	assert.deepEqual(activeBoostedSelection(stored, 13), {
		boostname: 'Crystal Wolf',
		raceid: '321',
		looktype: 101,
		lookaddons: 0,
		lookhead: 0,
		lookbody: 0,
		looklegs: 0,
		lookfeet: 0,
		lookmount: 0,
	});
	assert.equal(activeBoostedSelection(stored, 14), null);
});

void test('seed placeholders and invalid race ids are never presented as active', () => {
	assert.equal(
		activeBoostedSelection({ ...stored, boostname: 'default' }, 13),
		null,
	);
	assert.equal(activeBoostedSelection({ ...stored, raceid: '0' }, 13), null);
	assert.equal(activeBoostedSelection({ ...stored, raceid: '' }, 13), null);
});

void test('the client response uses the same validated daily selections', () => {
	const creature = activeBoostedSelection(stored, 13);
	assert.deepEqual(
		boostedClientResponse({ boostedCreature: creature, boostedBoss: null }),
		{
			boostedcreature: true,
			creatureraceid: 321,
		},
	);
	assert.deepEqual(
		boostedClientResponse({ boostedCreature: null, boostedBoss: null }),
		{ boostedcreature: false },
	);
});
