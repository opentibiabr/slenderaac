import assert from 'node:assert/strict';
import { test } from 'node:test';

import { activeBoostedSelection } from './boosted';

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
