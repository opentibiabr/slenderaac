import assert from 'node:assert/strict';
import { test } from 'node:test';

import { storageNumber } from './storage-values';

void test('native scalar samples preserve signed varints, zero and fixed64 numbers', () => {
	const values: [string, number][] = [
		['1000', 0],
		['100a', 10],
		['10ac02', 300],
		['10ffffffff07', 2147483647],
		['10ffffffffffffffffff01', -1],
		['19000000000000f83f', 1.5],
	];
	for (const [hex, expected] of values)
		assert.equal(storageNumber(Buffer.from(hex, 'hex')), expected, hex);
});

void test('truncated, compound, nonnumeric and nonfinite scalars are unavailable instead of zero', () => {
	for (const hex of [
		'',
		'10',
		'1080',
		'19',
		'1900000000',
		'100a100b',
		'0801',
		'3001',
		'0a0178',
		'19000000000000f07f',
		'19000000000000f87f',
		'10ffffffffffffffffffff01',
	])
		assert.equal(storageNumber(Buffer.from(hex, 'hex')), null, hex);
});
