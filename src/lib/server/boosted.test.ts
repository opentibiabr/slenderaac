import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	activeBoostedSelection,
	boostedClientResponse,
	inspectBoostedSelection,
} from './boosted';

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

void test('the persisted server selection is independent of the website clock', () => {
	assert.deepEqual(activeBoostedSelection(stored), {
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
	assert.deepEqual(
		activeBoostedSelection({ ...stored, date: '12' }),
		activeBoostedSelection(stored),
	);
});

void test('seed placeholders and invalid race ids are never presented as active', () => {
	assert.equal(
		activeBoostedSelection({ ...stored, boostname: 'default' }),
		null,
	);
	assert.equal(activeBoostedSelection({ ...stored, raceid: '0' }), null);
	assert.equal(activeBoostedSelection({ ...stored, raceid: '' }), null);
});

void test('daily selection diagnostics identify why a value is unavailable', () => {
	assert.equal(inspectBoostedSelection(null).state, 'missing');
	assert.equal(
		inspectBoostedSelection({ ...stored, boostname: '' }).state,
		'invalid-name',
	);
	assert.equal(
		inspectBoostedSelection({ ...stored, boostname: 'default' }).state,
		'placeholder',
	);
	assert.equal(
		inspectBoostedSelection({ ...stored, raceid: '0' }).state,
		'invalid-race',
	);
	assert.equal(inspectBoostedSelection(stored).state, 'active');
});

void test('the client response uses the same validated daily selections', () => {
	const creature = activeBoostedSelection(stored);
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
