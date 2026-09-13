import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { test } from 'node:test';

import { serverReachable } from './server-status';

void test('configured status checks handle open, closed and invalid endpoints without leaking connections', async () => {
	const server = createServer((socket) => socket.end());
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
	const address = server.address();
	assert.ok(address && typeof address !== 'string');
	const port = String(address.port);
	try {
		assert.equal(await serverReachable('127.0.0.1', port), true);
		for (const invalid of ['', '0', '65536', 'NaN', '8.5', '-1'])
			assert.equal(await serverReachable('127.0.0.1', invalid), false);
		assert.equal(await serverReachable('', port), false);
	} finally {
		await new Promise<void>((resolve, reject) =>
			server.close((error) => (error ? reject(error) : resolve())),
		);
	}
	assert.equal(await serverReachable('127.0.0.1', port), false);
});
