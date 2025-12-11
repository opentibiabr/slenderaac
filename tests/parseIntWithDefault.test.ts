import assert from 'node:assert/strict';

import { parseIntWithDefault } from '../src/routes/api/outfits/parseIntWithDefault.ts';

type TestCase = {
	readonly description: string;
	readonly input: unknown;
	readonly defaultValue?: number;
	readonly expected: number;
};

const testCases: TestCase[] = [
	{
		description: 'looktype query parses positive numbers',
		input: '512',
		expected: 512,
	},
	{
		description: 'mount query falls back to default on NaN',
		input: 'abc',
		expected: 0,
	},
	{
		description: 'lookhead query preserves zero string value',
		input: '0',
		expected: 0,
	},
	{
		description: 'lookbody query falls back on empty string',
		input: '',
		expected: 0,
	},
	{
		description: 'looklegs query falls back on null',
		input: null,
		expected: 0,
	},
	{
		description: 'lookfeet query falls back on undefined',
		input: undefined,
		expected: 0,
	},
	{
		description: 'lookaddons query falls back when value is NaN number',
		input: Number.NaN,
		expected: 0,
	},
	{
		description: 'direction query respects provided value',
		input: '7',
		defaultValue: 3,
		expected: 7,
	},
	{
		description: 'direction query falls back on invalid value',
		input: 'foo',
		defaultValue: 3,
		expected: 3,
	},
	{
		description: 'resize query respects binary string values',
		input: '1',
		defaultValue: 0,
		expected: 1,
	},
];

for (const { description, input, defaultValue, expected } of testCases) {
	const actual =
		defaultValue === undefined
			? parseIntWithDefault(input)
			: parseIntWithDefault(input, defaultValue);
	assert.equal(actual, expected, description);
}

console.log('All parseIntWithDefault tests passed');
