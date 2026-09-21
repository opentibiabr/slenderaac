import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	feedbackAnswers,
	feedbackInput,
	feedbackOpen,
	feedbackQuestions,
} from './feedback';

const questions = [{ id: 'q1', label: 'Your feedback', required: true }];
const input = (values: Record<string, string>) => {
	const data = new FormData();
	for (const [key, value] of Object.entries(values)) data.set(key, value);
	return data;
};

void test('feedback opens at the start and closes at the end, and drafts stay closed', () => {
	const form = {
		published: true,
		starts_at: new Date('2026-09-01Z'),
		ends_at: new Date('2026-10-01Z'),
	};
	assert.equal(feedbackOpen(form, new Date('2026-08-31Z')), false);
	assert.equal(feedbackOpen(form, form.starts_at), true);
	assert.equal(feedbackOpen(form, form.ends_at), false);
	assert.equal(
		feedbackOpen({ ...form, published: false }, form.starts_at),
		false,
	);
	assert.equal(
		feedbackOpen({ ...form, ends_at: null }, new Date('2027-01-01Z')),
		true,
	);
});

void test('questions reject ambiguous identifiers and malformed stored definitions', () => {
	assert.deepEqual(
		feedbackQuestions([{ ...questions[0], private: 'ignored' }]),
		questions,
	);
	for (const bad of [
		[],
		null,
		[questions[0], questions[0]],
		[{ ...questions[0], required: 'true' }],
		[{ ...questions[0], id: '__proto__' }],
		Array.from({ length: 21 }, (_, i) => ({ ...questions[0], id: `q${i}` })),
	])
		assert.throws(() => feedbackQuestions(bad));
});

void test('answers enforce required text, field multiplicity and per-answer limits', () => {
	assert.equal(
		feedbackAnswers(input({ 'answer-q1': '  ' }), questions).valid,
		false,
	);
	const data = input({ 'answer-q1': ' useful feedback ', account_id: '999' });
	assert.deepEqual(feedbackAnswers(data, questions).values, {
		q1: 'useful feedback',
	});
	data.append('answer-q1', 'second value');
	assert.equal(feedbackAnswers(data, questions).valid, false);
	data.set('answer-q1', new File(['text'], 'answer.txt'));
	assert.equal(feedbackAnswers(data, questions).valid, false);
	data.set('answer-q1', 'a'.repeat(2001));
	const result = feedbackAnswers(data, questions);
	assert.equal(result.valid, false);
	assert.equal(result.values.q1.length, 2000);
});

void test('combined answers are bounded and optional questions can be empty', () => {
	const many = Array.from({ length: 6 }, (_, i) => ({
		...questions[0],
		id: `q${i}`,
	}));
	const data = input(
		Object.fromEntries(many.map((q) => [`answer-${q.id}`, 'a'.repeat(2000)])),
	);
	assert.equal(feedbackAnswers(data, many).valid, false);
	assert.equal(
		feedbackAnswers(new FormData(), [{ ...questions[0], required: false }])
			.valid,
		true,
	);
});

void test('admin dates cannot normalize invalid days or create an inverted schedule', () => {
	const values = {
		title: 'Feedback',
		questions: 'First question\nSecond question',
		starts_at: '2026-09-01',
		ends_at: '',
		published: 'on',
	};
	const parsed = feedbackInput(input(values));
	assert.equal(parsed?.published, true);
	assert.equal(parsed?.questions.length, 2);
	assert.equal(parsed?.ends_at, null);
	for (const patch of [
		{ starts_at: '2026-02-30' },
		{ starts_at: '0000-01-01' },
		{ ends_at: '2026-09-01' },
		{ ends_at: '2026-08-31' },
		{ questions: '' },
		{ title: 'a'.repeat(256) },
	])
		assert.equal(feedbackInput(input({ ...values, ...patch })), null);
});
