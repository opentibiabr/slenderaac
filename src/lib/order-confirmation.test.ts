import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pollOrderConfirmation } from './order-confirmation';

async function withConfirmation(
	run: (fixture: {
		advance: (milliseconds: number) => Promise<void>;
		requests: { resolve: () => void; reject: (error: Error) => void }[];
		attempts: number[];
		finish: () => void;
		stop: () => void;
	}) => Promise<void>,
	initiallyPending = true,
) {
	const originalSetTimeout = globalThis.setTimeout;
	const originalClearTimeout = globalThis.clearTimeout;
	const timers = new Map<number, { at: number; callback: () => void }>();
	const requests: { resolve: () => void; reject: (error: Error) => void }[] =
		[];
	const attempts: number[] = [];
	let now = 0;
	let nextId = 0;
	let pending = initiallyPending;
	globalThis.setTimeout = ((callback: () => void, delay: number) => {
		const id = ++nextId;
		timers.set(id, { at: now + delay, callback });
		return id;
	}) as unknown as typeof setTimeout;
	globalThis.clearTimeout = ((id: number) =>
		timers.delete(id)) as unknown as typeof clearTimeout;
	const advance = async (milliseconds: number) => {
		now += milliseconds;
		for (const [id, timer] of [...timers]) {
			if (timer.at > now) continue;
			timers.delete(id);
			timer.callback();
		}
		await new Promise<void>((resolve) => setImmediate(resolve));
	};
	const stop = pollOrderConfirmation(
		() =>
			new Promise<void>((resolve, reject) =>
				requests.push({ resolve, reject }),
			),
		() => pending,
		(count) => attempts.push(count),
	);
	try {
		await run({
			advance,
			requests,
			attempts,
			finish: () => (pending = false),
			stop,
		});
	} finally {
		stop();
		globalThis.setTimeout = originalSetTimeout;
		globalThis.clearTimeout = originalClearTimeout;
	}
}

void test('slow order refreshes never overlap and stop after a final response', async () => {
	await withConfirmation(async ({ advance, requests, attempts, finish }) => {
		await advance(999);
		assert.equal(requests.length, 0);
		await advance(1);
		await advance(5000);
		assert.equal(requests.length, 1);
		assert.deepEqual(attempts, []);
		requests[0].resolve();
		await advance(0);
		await advance(999);
		assert.equal(requests.length, 1);
		await advance(1);
		assert.equal(requests.length, 2);
		finish();
		requests[1].resolve();
		await advance(0);
		await advance(10000);
		assert.equal(requests.length, 2);
		assert.deepEqual(attempts, [1, 2]);
	});
});

void test('final orders and orders finalized while waiting do not refresh', async () => {
	await withConfirmation(async ({ advance, requests }) => {
		await advance(10000);
		assert.equal(requests.length, 0);
	}, false);
	await withConfirmation(async ({ advance, requests, finish }) => {
		finish();
		await advance(1000);
		assert.equal(requests.length, 0);
	});
});

void test('failed refreshes recover or stop after ten attempts', async () => {
	await withConfirmation(async ({ advance, requests, attempts }) => {
		for (let i = 0; i < 10; i++) {
			await advance(1000);
			assert.equal(requests.length, i + 1);
			if (i === 1) requests[i].resolve();
			else requests[i].reject(new Error('offline'));
			await advance(0);
		}
		await advance(10000);
		assert.equal(requests.length, 10);
		assert.deepEqual(attempts, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	});
});

void test('leaving confirmation cancels timers and ignores in-flight completion', async () => {
	await withConfirmation(async ({ advance, requests, stop }) => {
		stop();
		await advance(1000);
		assert.equal(requests.length, 0);
	});
	for (const fails of [false, true]) {
		await withConfirmation(async ({ advance, requests, attempts, stop }) => {
			await advance(1000);
			stop();
			if (fails) requests[0].reject(new Error('offline'));
			else requests[0].resolve();
			await advance(0);
			await advance(10000);
			assert.equal(requests.length, 1);
			assert.deepEqual(attempts, []);
		});
	}
});
