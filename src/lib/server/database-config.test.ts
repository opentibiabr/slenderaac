import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkDatabaseConfiguration } from '$lib/server/database-config';
import { databaseConfiguration, prisma } from '$lib/server/prisma';

void test('database identity checks use the selected source and contain failures without exposing credentials', async () => {
	const originalConfiguration = { ...databaseConfiguration };
	// Preserve the Prisma method for restoration; the spy does not call it unbound.
	// eslint-disable-next-line @typescript-eslint/unbound-method
	const queryRaw = prisma.$queryRaw;
	const originalConsole = {
		info: console.info,
		debug: console.debug,
		warn: console.warn,
	};
	const lines: string[] = [];
	let calls = 0;
	let actual: string | null = 'game-world';
	let failure = false;
	Object.assign(prisma, {
		$queryRaw: () => {
			calls++;
			if (failure)
				return Promise.reject(
					Object.assign(new Error('mysql://user:secret@host/private'), {
						code: 'P1001',
					}),
				);
			return Promise.resolve([
				{ database: actual, host: 'db-host', port: '3306' },
			]);
		},
	});
	const record = (line: string) => lines.push(line);
	Object.assign(console, { info: record, debug: record, warn: record });
	try {
		Object.assign(databaseConfiguration, {
			source: 'DATABASE_URL',
			database: 'game-world',
		});
		await checkDatabaseConfiguration();
		assert.equal(calls, 0);
		databaseConfiguration.source = 'SERVER_CONFIG_FILE';
		await checkDatabaseConfiguration();
		assert.equal(calls, 1);
		assert.ok(
			lines.some((line) =>
				line.includes('database="game-world" source=SERVER_CONFIG_FILE'),
			),
		);
		assert.doesNotMatch(lines.join('\n'), /db-host/);
		actual = 'other-world';
		await checkDatabaseConfiguration();
		assert.ok(lines.some((line) => /\[warn\].*differs from/.test(line)));
		failure = true;
		await checkDatabaseConfiguration();
		assert.ok(lines.some((line) => /\[warn\].*code=P1001/.test(line)));
		assert.doesNotMatch(lines.join('\n'), /secret|mysql:\/\/|host\/private/);
		failure = false;
		actual = 'game-world';
		databaseConfiguration.source = 'DATABASE_URL';
		await checkDatabaseConfiguration(true);
		assert.ok(lines.some((line) => /\[debug\].*db-host/.test(line)));
	} finally {
		Object.assign(prisma, { $queryRaw: queryRaw });
		Object.assign(databaseConfiguration, originalConfiguration);
		Object.assign(console, originalConsole);
	}
});
