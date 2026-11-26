import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

import { compare, hash } from 'bcrypt';

import { rehashLegacyPassword } from './password-migration';

const sha1 = (password: string) =>
	createHash('sha1').update(password).digest('hex');

void test('a matching legacy password at the bcrypt byte limit is upgraded', async () => {
	const password = 'é'.repeat(36);
	const account = { id: 123, password: sha1(password) };
	let updated: string | undefined;
	await rehashLegacyPassword(account, password, (args) => {
		assert.deepEqual(args.where, { id: 123, password: account.password });
		assert.ok(typeof args.data.password === 'string');
		updated = args.data.password;
		return Promise.resolve({ count: 1 });
	});
	assert.ok(updated);
	assert.match(updated, /^\$2b\$12\$/);
	assert.ok(await compare(password, updated));
	assert.equal(await compare('different password', updated), false);
});

void test('oversize, incorrect and already upgraded passwords cause no write', async () => {
	const password = 'é'.repeat(37);
	const unexpectedWrite = () => assert.fail('Unexpected password update');
	await rehashLegacyPassword(
		{ id: 124, password: sha1(password) },
		password,
		unexpectedWrite,
	);
	await rehashLegacyPassword(
		{ id: 124, password: sha1('existing password') },
		'wrong password',
		unexpectedWrite,
	);
	await rehashLegacyPassword(
		{ id: 124, password: await hash('existing password', 4) },
		'existing password',
		unexpectedWrite,
	);
});

void test('an intervening reset wins over an upgrade based on the old hash', async () => {
	const password = 'original password';
	const account = { id: 125, password: sha1(password) };
	const resetHash = await hash('reset password', 4);
	let storedPassword = resetHash;

	await rehashLegacyPassword(account, password, ({ where, data }) => {
		assert.equal(where?.id, account.id);
		if (where?.password !== storedPassword)
			return Promise.resolve({ count: 0 });
		assert.ok(typeof data.password === 'string');
		storedPassword = data.password;
		return Promise.resolve({ count: 1 });
	});
	assert.equal(storedPassword, resetHash);
});
