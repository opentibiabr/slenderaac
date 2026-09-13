import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

// Opt in with SLENDER_TEST_DATABASE=true against a disposable local database.
void test(
	'session revocation, account deletion and expiry take effect after login',
	{ skip: process.env.SLENDER_TEST_DATABASE !== 'true' },
	async () => {
		const { prisma } = await import('./prisma');
		const { createSession, deleteSession, getSession } = await import(
			'./session'
		);
		const marker = `session-test-${randomUUID().slice(0, 12)}`;
		const account = await prisma.accounts.create({
			data: {
				name: marker,
				email: `${marker}@example.invalid`,
				password: 'not-a-login-password',
				type: 1,
			},
		});
		try {
			const sid = await createSession(account.email, 60);
			assert.equal((await getSession(sid))?.accountId, account.id);
			await prisma.accountSessions.delete({ where: { id: sid } });
			assert.equal(
				await getSession(sid),
				undefined,
				'revoked sessions must not survive in memory',
			);
			await Promise.all([deleteSession(sid), deleteSession(sid)]);

			const expired = await createSession(account.email, 60);
			await prisma.accountSessions.update({
				where: { id: expired },
				data: { expires: BigInt(Date.now() - 1) },
			});
			assert.equal(
				await getSession(expired),
				undefined,
				'changed expiration must be honored',
			);
			assert.equal(
				await prisma.accountSessions.findUnique({ where: { id: expired } }),
				null,
			);

			const deleted = await createSession(account.email, 60);
			await prisma.accounts.delete({ where: { id: account.id } });
			assert.equal(
				await getSession(deleted),
				undefined,
				'deleted accounts must lose their sessions',
			);
		} finally {
			await prisma.accounts.deleteMany({ where: { id: account.id } });
			await prisma.$disconnect();
		}
	},
);
