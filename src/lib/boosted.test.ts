import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	boostedRefreshInterval,
	parseBoostedSelections,
	pollBoostedSelections,
} from './boosted';

const outfit = (boostname: string, raceid: string) => ({
	boostname,
	raceid,
	looktype: 100,
	lookaddons: 0,
	lookhead: 1,
	lookbody: 2,
	looklegs: 3,
	lookfeet: 4,
	lookmount: null,
});

void test('boosted responses preserve valid selections and explicit empty slots', () => {
	assert.deepEqual(
		parseBoostedSelections({
			boostedCreature: outfit('Crystal Wolf', '321'),
			boostedBoss: null,
		}),
		{
			boostedCreature: outfit('Crystal Wolf', '321'),
			boostedBoss: null,
		},
	);
	for (const value of [
		null,
		{},
		{ boostedCreature: null },
		{
			boostedCreature: { ...outfit('Wrong', '1'), looktype: -1 },
			boostedBoss: null,
		},
		{
			boostedCreature: outfit('Wrong', 'not-a-race'),
			boostedBoss: null,
		},
		{
			boostedCreature: outfit('Wrong', '999999999999999999999999'),
			boostedBoss: null,
		},
	])
		assert.equal(parseBoostedSelections(value), null);
});

void test('boosted polling fetches immediately and publishes a daily selection change', async () => {
	const originalFetch = globalThis.fetch;
	const originalSetTimeout = globalThis.setTimeout;
	const originalClearTimeout = globalThis.clearTimeout;
	const timers = new Map<number, { at: number; callback: () => void }>();
	const requests: {
		signal: AbortSignal;
		resolve: (response: Response) => void;
	}[] = [];
	const updates: unknown[] = [];
	let now = 0;
	let nextId = 0;

	globalThis.setTimeout = ((callback: () => void, delay: number) => {
		const id = ++nextId;
		timers.set(id, { at: now + delay, callback });
		return id;
	}) as unknown as typeof setTimeout;
	globalThis.clearTimeout = ((id: number) =>
		timers.delete(id)) as unknown as typeof clearTimeout;
	globalThis.fetch = ((_url: string, init: RequestInit) =>
		new Promise<Response>((resolve) => {
			requests.push({ signal: init.signal as AbortSignal, resolve });
		})) as typeof fetch;

	const advance = async (milliseconds: number) => {
		now += milliseconds;
		for (const [id, timer] of [...timers]) {
			if (timer.at > now) continue;
			timers.delete(id);
			timer.callback();
		}
		await new Promise<void>((resolve) => setImmediate(resolve));
	};
	const stop = pollBoostedSelections((selection) => updates.push(selection));
	try {
		assert.equal(requests.length, 1);
		requests[0].resolve(
			Response.json({
				boostedCreature: outfit('First Creature', '100'),
				boostedBoss: outfit('First Boss', '200'),
			}),
		);
		await advance(0);
		assert.equal(updates.length, 1);
		await advance(boostedRefreshInterval - 1);
		assert.equal(requests.length, 1);
		await advance(1);
		assert.equal(requests.length, 2);
		requests[1].resolve(
			Response.json({
				boostedCreature: outfit('Next Creature', '101'),
				boostedBoss: outfit('Next Boss', '201'),
			}),
		);
		await advance(0);
		assert.equal(updates.length, 2);
		assert.deepEqual(updates.at(-1), {
			boostedCreature: outfit('Next Creature', '101'),
			boostedBoss: outfit('Next Boss', '201'),
		});
	} finally {
		stop();
		globalThis.fetch = originalFetch;
		globalThis.setTimeout = originalSetTimeout;
		globalThis.clearTimeout = originalClearTimeout;
	}
});
