import assert from 'node:assert/strict';
import { test } from 'node:test';

import { prisma } from './prisma';

void test('background session cleanup contains database failures and retries on its next interval', async () => {
	// Saved for restoration only; the original method is never called unbound.
	// eslint-disable-next-line @typescript-eslint/unbound-method
	const originalDeleteMany = prisma.accountSessions.deleteMany;
	const originalInterval = globalThis.setInterval;
	const originalError = console.error;
	const originalInfo = console.info;
	const errors: string[] = [];
	const queries: unknown[] = [];
	let timer: ReturnType<typeof setInterval> | undefined;
	let refresh: (() => void) | undefined;
	let fail = true;

	Object.assign(prisma.accountSessions, {
		deleteMany: (query: unknown) => {
			queries.push(query);
			return fail
				? Promise.reject(
						Object.assign(new Error('private connection details'), {
							code: 'P1001',
						}),
					)
				: Promise.resolve({ count: 2 });
		},
	});
	globalThis.setInterval = ((callback: () => void, delay: number) => {
		assert.equal(delay, 60 * 60 * 1000);
		refresh = callback;
		timer = originalInterval(callback, delay);
		return timer;
	}) as typeof setInterval;
	console.error = (...values: unknown[]) => errors.push(values.join(' '));
	console.info = () => {};

	try {
		await import('./session');
		await new Promise((resolve) => setImmediate(resolve));
		assert.equal(queries.length, 1, 'startup must attempt cleanup');
		assert.equal(errors.length, 1);
		assert.match(errors[0], /P1001/);
		assert.doesNotMatch(errors[0], /private connection details/);
		assert.ok(refresh, 'the hourly cleanup must remain scheduled');

		fail = false;
		const before = Date.now();
		refresh();
		await new Promise((resolve) => setImmediate(resolve));
		assert.equal(
			queries.length,
			2,
			'a failed startup must not disable cleanup',
		);
		const query = queries[1] as { where: { expires: { lt: number } } };
		assert.ok(query.where.expires.lt >= before);
		assert.ok(query.where.expires.lt <= Date.now());
		assert.equal(errors.length, 1, 'successful cleanup must not log a failure');

		fail = true;
		refresh();
		await new Promise((resolve) => setImmediate(resolve));
		assert.equal(queries.length, 3);
		assert.equal(errors.length, 2, 'periodic failures must also be contained');
	} finally {
		clearInterval(timer);
		globalThis.setInterval = originalInterval;
		Object.assign(prisma.accountSessions, { deleteMany: originalDeleteMany });
		console.error = originalError;
		console.info = originalInfo;
	}
});
