import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

import { PrismaClient } from '@prisma/client';
import { authenticator } from 'otplib';

import {
	checkAuthenticatorToken,
	newRecoveryCodes,
	verifyAccountFactor,
	withLockedAccount,
} from './account-2fa';

void test('new recovery codes are independent and persisted as digests', () => {
	const { codes, rows } = newRecoveryCodes();
	assert.equal(new Set(codes).size, 6);
	for (const [index, code] of codes.entries()) {
		assert.match(code, /^[0-9a-f]{32}$/);
		assert.match(rows[index].code, /^sha256:[0-9a-f]{64}$/);
		assert.ok(!rows[index].code.includes(code));
	}
});

void test('the authenticator check accepts six digits as a string', () => {
	const secret = authenticator.generateSecret();
	const token = authenticator.generate(secret);
	assert.equal(checkAuthenticatorToken(token, secret), true);
	assert.equal(checkAuthenticatorToken(Number(token), secret), false);
	assert.equal(checkAuthenticatorToken('abcde', secret), false);
});

const databaseUrl = process.env.SLENDER_AUTH_TEST_DATABASE_URL;
void test(
	'recovery codes commit with the session, survive rollback and keep TOTP enabled',
	{ skip: !databaseUrl },
	async () => {
		assert.ok(databaseUrl);
		const url = new URL(databaseUrl);
		assert.equal(url.protocol, 'mysql:');
		assert.equal(url.hostname, '127.0.0.1');
		assert.match(url.pathname, /^\/slender_auth_test_[a-z0-9_]+$/);

		const db = new PrismaClient({ datasourceUrl: databaseUrl });
		const second = new PrismaClient({ datasourceUrl: databaseUrl });
		const { codes, rows } = newRecoveryCodes();
		const secret = authenticator.generateSecret();
		const email = `auth-fixture-${randomUUID()}@example.invalid`;
		try {
			const { id } = await db.accounts.create({
				data: {
					email,
					name: 'auth fixture',
					password: 'fixture',
					token_secret: secret,
					backupCodes: {
						createMany: {
							data: [...rows, { code: 'abcde' }, { code: 'abcde' }],
						},
					},
				},
			});

			const signIn = (database: PrismaClient, token: string) =>
				withLockedAccount(database, id, async (tx, current) => {
					if (!current || !(await verifyAccountFactor(tx, current, token)))
						return false;
					await tx.accountSessions.create({
						data: { account_id: id, expires: Date.now() + 60_000 },
					});
					return true;
				});

			await assert.rejects(
				withLockedAccount(db, id, async (tx, current) => {
					assert.ok(current);
					assert.equal(await verifyAccountFactor(tx, current, codes[0]), true);
					throw new Error('aborted session write');
				}),
				/aborted session write/,
			);
			const outcomes = await Promise.all([
				signIn(db, codes[0]),
				signIn(second, codes[0]),
			]);
			assert.equal(outcomes.filter(Boolean).length, 1);
			assert.equal(
				await db.accountSessions.count({ where: { account_id: id } }),
				1,
			);
			assert.equal(await signIn(db, 'abcde'), true);
			assert.equal(await signIn(second, 'abcde'), false);
			for (const code of codes.slice(1)) {
				assert.equal(await signIn(db, code), true);
			}
			assert.equal(
				await db.accountBackupCodes.count({
					where: { account_id: id, used: false },
				}),
				0,
			);
			assert.equal(
				(await db.accounts.findUniqueOrThrow({ where: { id } })).token_secret,
				secret,
			);
			assert.equal(await signIn(db, authenticator.generate(secret)), true);
		} finally {
			await db.accounts.deleteMany({ where: { email } });
			await Promise.all([db.$disconnect(), second.$disconnect()]);
		}
	},
);
