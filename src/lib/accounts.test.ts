import assert from 'node:assert/strict';
import { test } from 'node:test';

import { AccountType, isAccountType } from './accounts';

void test('account roles match the game server values without promoting community managers', () => {
	assert.equal(AccountType.CommunityManager, 5);
	assert.equal(AccountType.God, 6);
	for (const type of [1, 2, 3, 4, 5, 6]) {
		assert.equal(isAccountType(type), true);
	}
});

void test('account validation rejects unsupported and non-numeric roles', () => {
	for (const type of [0, 7, -1, 5.5, '6', 'God', null, undefined, NaN]) {
		assert.equal(isAccountType(type), false);
	}
});
