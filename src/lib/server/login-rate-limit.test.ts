import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

import { PrismaClient } from '@prisma/client';

import {
	deleteExpiredLoginBuckets,
	sourceBucket,
	takeLoginAttempt,
} from './login-rate-limit';

void test('source buckets normalize addresses and handle missing proxy data', () => {
	const ipv4 = sourceBucket(() => '192.0.2.4');
	assert.equal(
		sourceBucket(() => '::ffff:192.0.2.4'),
		ipv4,
	);
	assert.equal(
		sourceBucket(() => '::ffff:c000:204'),
		ipv4,
	);
	assert.equal(
		sourceBucket(() => '2001:db8:0:0::1'),
		sourceBucket(() => '2001:db8::1'),
	);
	assert.equal(
		sourceBucket(() => 'fe80::1%eth0'),
		sourceBucket(() => 'fe80::1'),
	);
	assert.notEqual(
		sourceBucket(() => '192.0.2.5'),
		ipv4,
	);
	assert.equal(
		sourceBucket(() => '192.0.2.4, 127.0.0.1'),
		'source:unknown',
	);
	assert.equal(
		sourceBucket(() => {
			throw new Error('missing forwarded address');
		}),
		'source:unknown',
	);
});

const databaseUrl = process.env.SLENDER_AUTH_TEST_DATABASE_URL;
void test(
	'two instances share a bounded window and rejected requests do not extend it',
	{ skip: !databaseUrl },
	async () => {
		assert.ok(databaseUrl);
		const url = new URL(databaseUrl);
		assert.equal(url.protocol, 'mysql:');
		assert.equal(url.hostname, '127.0.0.1');
		assert.match(url.pathname, /^\/slender_auth_test_[a-z0-9_]+$/);

		const db = new PrismaClient({ datasourceUrl: databaseUrl });
		const second = new PrismaClient({ datasourceUrl: databaseUrl });
		const marker = randomUUID();
		const bucket = `password:${marker}`;
		const factor = `factor:${marker}`;
		const limit = { max: 3, windowMs: 1000 };
		const now = Date.now();
		try {
			const decisions = await Promise.all(
				Array.from({ length: 10 }, (_, i) =>
					takeLoginAttempt(i % 2 ? db : second, bucket, limit, now),
				),
			);
			assert.equal(decisions.filter(Boolean).length, 3);
			assert.equal(
				await takeLoginAttempt(second, bucket, limit, now + 999),
				false,
			);
			assert.equal(
				await takeLoginAttempt(second, factor, limit, now + 999),
				true,
			);
			assert.equal(await takeLoginAttempt(db, bucket, limit, now + 1000), true);
			await deleteExpiredLoginBuckets(second, now + 1999);
			assert.equal(
				await db.loginAttemptBucket.count({ where: { bucket: factor } }),
				0,
			);
			assert.equal(await db.loginAttemptBucket.count({ where: { bucket } }), 1);
		} finally {
			await db.loginAttemptBucket.deleteMany({
				where: { bucket: { in: [bucket, factor] } },
			});
			await Promise.all([db.$disconnect(), second.$disconnect()]);
		}
	},
);
