import assert from 'node:assert/strict';
import { test } from 'node:test';

import { prisma } from '$lib/server/prisma';

import {
	activeBoostedSelection,
	boostedClientResponse,
	inspectBoostedSelection,
	loadBoostedSelections,
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

void test('unavailable source diagnostics are opt-in, bounded and cannot replace API data', async () => {
	const seed = { ...stored, date: '0', boostname: 'default', raceid: '0' };
	let current: typeof stored | null = seed;
	let rows = [seed, stored];
	let inspectionError: Error | undefined;
	let inspections = 0;
	const lines: string[] = [];
	const originalConsole = {
		info: console.info,
		debug: console.debug,
		warn: console.warn,
	};
	const originalQueries = [prisma.boostedCreature, prisma.boostedBoss].map(
		(table) => ({
			table,
			findFirst: table.findFirst,
			findMany: table.findMany,
		}),
	);
	try {
		for (const level of ['info', 'debug', 'warn'] as const) {
			console[level] = (line: string) => {
				lines.push(line);
			};
		}
		for (const table of [prisma.boostedCreature, prisma.boostedBoss]) {
			Object.assign(table, {
				findFirst: () => Promise.resolve(current),
				findMany: (options: { take: number }) => {
					inspections++;
					assert.equal(options.take, 6);
					if (inspectionError) return Promise.reject(inspectionError);
					return Promise.resolve(rows);
				},
			});
		}
		const unavailable = { boostedCreature: null, boostedBoss: null };
		assert.deepEqual(await loadBoostedSelections(), unavailable);
		assert.equal(inspections, 0);
		assert.ok(lines.some((line) => /\[warn\].*SERVER_CONFIG_FILE/.test(line)));
		await loadBoostedSelections();
		assert.equal(lines.filter((line) => line.includes('[boosted]')).length, 1);

		assert.deepEqual(await loadBoostedSelections(true), unavailable);
		assert.equal(inspections, 2);
		const sourceLine = lines.find((line) => line.includes('[boosted.source]'));
		assert.ok(sourceLine);
		assert.match(sourceLine, /"date":"0","boostname":"default","raceid":"0"/);
		assert.match(sourceLine, /"state":"placeholder"/);
		assert.match(sourceLine, /"state":"active"/);
		assert.match(sourceLine, /boosted_creature/);
		assert.match(sourceLine, /boosted_boss/);
		lines.length = 0;
		await loadBoostedSelections(true);
		assert.equal(
			lines.some((line) => line.includes('[boosted.source]')),
			false,
		);

		rows = Array.from({ length: 6 }, () => ({
			...seed,
			boostname: 'x'.repeat(200),
		}));
		await loadBoostedSelections(true);
		const boundedLine = lines.find((line) => line.includes('[boosted.source]'));
		assert.ok(boundedLine);
		const sample = JSON.parse(boundedLine.split('[boosted.source] ')[1]) as {
			moreRows: boolean;
			rows: { boostname: string }[];
		}[];
		assert.equal(sample[0].moreRows, true);
		assert.equal(sample[0].rows.length, 5);
		assert.equal(sample[0].rows[0].boostname.length, 128);

		inspectionError = Object.assign(
			new Error('mysql://user:secret@private/database'),
			{
				code: 'P1001',
			},
		);
		assert.deepEqual(await loadBoostedSelections(true), unavailable);
		assert.ok(lines.some((line) => line.includes('failed code=P1001')));
		assert.doesNotMatch(lines.join('\n'), /secret|private\/database/);
		inspectionError = undefined;
		current = null;
		rows = [];
		lines.length = 0;
		assert.deepEqual(await loadBoostedSelections(true), unavailable);
		assert.ok(
			lines.some((line) => /\[boosted.source\].*"rows":\[\]/.test(line)),
		);
		current = stored;
		const before = inspections;
		assert.ok((await loadBoostedSelections(true)).boostedCreature);
		assert.equal(inspections, before);
		current = seed;
		lines.length = 0;
		await loadBoostedSelections(true);
		assert.ok(lines.some((line) => line.includes('[boosted.source]')));
	} finally {
		Object.assign(console, originalConsole);
		for (const { table, findFirst, findMany } of originalQueries) {
			Object.assign(table, { findFirst, findMany });
		}
	}
});
