import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pollChoice, pollInput, pollOptions, pollResults } from './polls';

const options = [
	{ id: 'o1', label: 'Exploring' },
	{ id: 'o2', label: 'Hunting' },
];

void test('poll options have stable distinct identifiers and labels', () => {
	assert.deepEqual(pollOptions(options), options);
	for (const invalid of [
		[],
		[options[0]],
		[options[0], options[0]],
		[options[0], { ...options[1], label: ' Exploring ' }],
		[{ ...options[0], id: '__proto__' }, options[1]],
		[null, options[1]],
	])
		assert.throws(() => pollOptions(invalid));
});

void test('votes accept exactly one option from the current poll', () => {
	const data = new FormData();
	assert.equal(pollChoice(data, options), null);
	data.set('option', 'unknown');
	assert.equal(pollChoice(data, options), null);
	data.set('option', 'o1');
	assert.equal(pollChoice(data, options), 'o1');
	data.append('option', 'o2');
	assert.equal(pollChoice(data, options), null);
	data.set('option', new File(['o1'], 'vote.txt'));
	assert.equal(pollChoice(data, options), null);
});

void test('results count only declared choices and handle empty polls', () => {
	assert.deepEqual(
		pollResults(options, []).options.map((o) => o.percent),
		[0, 0],
	);
	const result = pollResults(options, [
		{ option_id: 'o1', count: 1 },
		{ option_id: 'o2', count: 3 },
		{ option_id: 'unknown', count: 9 },
	]);
	assert.equal(result.total, 4);
	assert.deepEqual(
		result.options.map((o) => o.percent),
		[25, 75],
	);
});

void test('poll editor validates date windows and distinct choices', () => {
	const data = new FormData();
	for (const [key, value] of Object.entries({
		title: 'Preferred activity?',
		description: 'Choose one',
		options: 'Exploring\nHunting',
		starts_at: '2026-09-01',
		ends_at: '2026-09-10',
		published: 'on',
	}))
		data.set(key, value);
	assert.equal(pollInput(data)?.options.length, 2);
	data.set('ends_at', '2026-09-01');
	assert.equal(pollInput(data), null);
	data.set('ends_at', '');
	data.set('options', 'Exploring\nexploring');
	assert.equal(pollInput(data), null);
});
