import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	questDate,
	questInput,
	questResultInput,
	questTiming,
	withinQuestDates,
} from './world-quests';

void test('quest calendar dates keep UTC days and compact non-breaking labels', () => {
	assert.equal(
		questDate(new Date('2026-09-09T00:00Z')),
		'Sep\u00a009\u00a02026',
	);
	assert.equal(
		questDate(new Date('2026-09-09T23:59Z'), true),
		'Sep 09, 2026, 23:59 UTC',
	);
});

void test('quest publication requires native text and a stable local slug', () => {
	const form = new FormData();
	for (const [key, value] of Object.entries({
		slug: '  Spring-Quest ',
		name: 'Spring Quest',
		description: 'Explore the server together.',
		kind: 'event',
		sort_order: '0',
	}))
		form.set(key, value);
	assert.equal(questInput(form)?.slug, 'spring-quest');
	assert.equal(questInput(form)?.published, false);
	for (const slug of [
		'../quest',
		'https://example.test',
		'bad slug',
		'-bad',
		'a'.repeat(101),
	]) {
		form.set('slug', slug);
		assert.equal(questInput(form), null);
	}
});

void test('quest outcomes use strict historical UTC timestamps and explicit outcomes', () => {
	const form = new FormData();
	form.set('outcome', 'success');
	form.set('occurred_at', '2026-09-09T10:00');
	const now = new Date('2026-09-09T11:00Z');
	assert.equal(
		questResultInput(form, now)?.occurred_at.toISOString(),
		'2026-09-09T10:00:00.000Z',
	);
	for (const stamp of [
		'2026-02-30T10:00',
		'2026-09-09T24:00',
		'2026-09-10T00:00',
		'invalid',
		'1999-01-01T00:00',
	]) {
		form.set('occurred_at', stamp);
		assert.equal(questResultInput(form, now), null);
	}
});

void test('event classification and results retain inclusive UTC date boundaries', () => {
	const event = {
		starts_at: new Date('2026-09-01T00:00Z'),
		ends_at: new Date('2026-09-09T00:00Z'),
	};
	assert.equal(
		withinQuestDates(new Date('2026-09-09T23:59:59.999Z'), event),
		true,
	);
	assert.equal(withinQuestDates(new Date('2026-09-10T00:00Z'), event), false);
	assert.equal(withinQuestDates(new Date('2026-08-31T23:59Z'), event), false);
	const next = {
		starts_at: new Date('2026-10-01T00:00Z'),
		ends_at: new Date('2026-10-02T00:00Z'),
	};
	assert.deepEqual(questTiming([next, event], new Date('2026-09-09T23:59Z')), {
		running: event,
		next,
	});
	assert.deepEqual(questTiming([event], new Date('2026-09-10T00:00Z')), {
		running: null,
		next: null,
	});
});
