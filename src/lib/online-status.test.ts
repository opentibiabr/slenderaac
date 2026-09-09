import assert from 'node:assert/strict';
import { test } from 'node:test';

import { type OnlineStatus, pollOnlineStatus } from './online-status';

async function withPollingFixture(
	run: (fixture: {
		advance: (milliseconds: number) => Promise<void>;
		requests: {
			signal: AbortSignal;
			resolve: (response: Response) => void;
			reject: (error: Error) => void;
		}[];
		updates: OnlineStatus[];
		stop: () => void;
	}) => Promise<void>,
) {
	const originalFetch = globalThis.fetch;
	const originalSetTimeout = globalThis.setTimeout;
	const originalClearTimeout = globalThis.clearTimeout;
	const timers = new Map<number, { at: number; callback: () => void }>();
	const requests: {
		signal: AbortSignal;
		resolve: (response: Response) => void;
		reject: (error: Error) => void;
	}[] = [];
	const updates: OnlineStatus[] = [];
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
		new Promise<Response>((resolve, reject) => {
			requests.push({ signal: init.signal as AbortSignal, resolve, reject });
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
	const stop = pollOnlineStatus((status) => updates.push(status));
	try {
		await run({ advance, requests, updates, stop });
	} finally {
		stop();
		globalThis.fetch = originalFetch;
		globalThis.setTimeout = originalSetTimeout;
		globalThis.clearTimeout = originalClearTimeout;
	}
}

void test('status polling validates responses, preserves the last value on failures and recovers', async () => {
	await withPollingFixture(async ({ advance, requests, updates }) => {
		requests[0].resolve(
			Response.json({
				serverOnline: true,
				onlinePlayerCount: 12,
				topbarStats: {
					twitchChannels: 2.9,
					twitchViewers: -1,
					youtubeChannels: 'wrong',
				},
			}),
		);
		await advance(0);
		assert.deepEqual(updates, [
			{
				serverOnline: true,
				onlinePlayerCount: 12,
				topbarStats: {
					twitchChannels: 2,
					twitchViewers: 0,
					youtubeChannels: 0,
					youtubeViewers: 0,
				},
			},
		]);
		const failures = [
			new Response('unavailable', { status: 503 }),
			new Response('not json'),
			Response.json(null),
			Response.json({ serverOnline: 'true', onlinePlayerCount: 14 }),
			Response.json({ serverOnline: false, onlinePlayerCount: -1 }),
			Response.json({ serverOnline: true, onlinePlayerCount: 1.5 }),
			new Error('network disconnected'),
		];
		for (const failure of failures) {
			await advance(5000);
			const request = requests[requests.length - 1];
			if (failure instanceof Error) request.reject(failure);
			else request.resolve(failure);
			await advance(0);
			assert.equal(updates.length, 1);
		}
		await advance(5000);
		requests[requests.length - 1].resolve(
			Response.json({ serverOnline: false, onlinePlayerCount: 0 }),
		);
		await advance(0);
		assert.equal(updates.length, 2);
		assert.equal(updates[1].serverOnline, false);
		assert.equal(updates[1].onlinePlayerCount, 0);
	});
});

void test('a slow status request is aborted without overlapping or publishing its late response', async () => {
	await withPollingFixture(async ({ advance, requests, updates, stop }) => {
		await advance(5000);
		assert.equal(requests[0].signal.aborted, true);
		assert.equal(requests.length, 1);
		requests[0].resolve(
			Response.json({ serverOnline: true, onlinePlayerCount: 99 }),
		);
		await advance(0);
		assert.equal(updates.length, 0);
		await advance(5000);
		assert.equal(requests.length, 2);
		stop();
		assert.equal(requests[1].signal.aborted, true);
		requests[1].resolve(
			Response.json({ serverOnline: true, onlinePlayerCount: 1 }),
		);
		await advance(10000);
		assert.equal(updates.length, 0);
		assert.equal(requests.length, 2);
	});
});
