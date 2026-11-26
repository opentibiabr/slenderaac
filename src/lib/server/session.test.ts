import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
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
			const legacy = await prisma.accountSessions.create({
				data: { account_id: account.id, expires: Date.now() + 60_000 },
			});
			assert.equal(await getSession(legacy.id), undefined);
			const gameSession = await prisma.gameAccountSessions.create({
				data: {
					account_id: account.id,
					expires: Math.floor(Date.now() / 1000) + 60,
				},
			});

			for (const type of [5, 6]) {
				await prisma.accounts.update({
					where: { id: account.id },
					data: { type },
				});
				const staffSession = await createSession(account.email, 60);
				assert.equal((await getSession(staffSession))?.type, type);
				await deleteSession(staffSession);
			}
			const sid = await createSession(account.email, 60);
			assert.match(sid, /^v2\.[A-Za-z0-9_-]{43}$/);
			const id = `v2:${createHash('sha256').update(sid).digest('hex')}`;
			const stored = await prisma.accountSessions.findUniqueOrThrow({
				where: { id },
			});
			assert.equal(stored.account_id, account.id);
			assert.equal(await getSession(stored.id), undefined);
			assert.equal(await getSession(`${sid}\n`), undefined);
			assert.equal((await getSession(sid))?.accountId, account.id);
			await prisma.accounts.update({
				where: { id: account.id },
				data: { type: 5 },
			});
			assert.equal(
				(await getSession(sid))?.type,
				5,
				'a role change must be visible to an existing session',
			);
			await prisma.accountSessions.delete({ where: { id } });
			assert.equal(
				await getSession(sid),
				undefined,
				'revoked sessions must not survive in memory',
			);
			await Promise.all([deleteSession(sid), deleteSession(sid)]);

			const expired = await createSession(account.email, 60);
			const expiredId = `v2:${createHash('sha256').update(expired).digest('hex')}`;
			const now = Date.now();
			await prisma.accountSessions.update({
				where: { id: expiredId },
				data: { expires: BigInt(now) },
			});
			const originalNow = Date.now;
			try {
				Date.now = () => now;
				assert.equal(
					await getSession(expired),
					undefined,
					'a session expires at its stored deadline',
				);
			} finally {
				Date.now = originalNow;
			}
			assert.equal(
				await prisma.accountSessions.findUnique({ where: { id: expiredId } }),
				null,
			);
			assert.equal(
				(
					await prisma.gameAccountSessions.findUnique({
						where: { id: gameSession.id },
					})
				)?.expires,
				gameSession.expires,
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
