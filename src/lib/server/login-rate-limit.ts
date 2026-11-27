import { createHash } from 'node:crypto';
import { isIP } from 'node:net';

import type { Prisma, PrismaClient } from '@prisma/client';

export const LOGIN_LIMITS = {
	source: { max: 120, windowMs: 60_000 },
	password: { max: 20, windowMs: 120_000 },
	factor: { max: 8, windowMs: 180_000 },
};

export function sourceBucket(getClientAddress: () => string) {
	let address: string;
	try {
		address = getClientAddress();
	} catch {
		return 'source:unknown';
	}

	const family = isIP(address);
	if (!family) return 'source:unknown';
	if (family === 6) {
		address = new URL(`http://[${address.split('%', 1)[0]}]`).hostname.slice(
			1,
			-1,
		);
		const mapped = /^::ffff:([a-f0-9]+):([a-f0-9]+)$/.exec(address);
		if (mapped) {
			const high = parseInt(mapped[1], 16);
			const low = parseInt(mapped[2], 16);
			address = [high >> 8, high & 255, low >> 8, low & 255].join('.');
		}
	}

	return 'source:' + createHash('sha256').update(address).digest('hex');
}

type LoginLimit = { max: number; windowMs: number };

export function takeLoginAttempt(
	database: PrismaClient,
	bucket: string,
	limit: LoginLimit,
	now = Date.now(),
) {
	return database.$transaction((tx) =>
		reserveLoginAttempt(tx, bucket, limit, now),
	);
}

export async function reserveLoginAttempt(
	tx: Prisma.TransactionClient,
	bucket: string,
	limit: LoginLimit,
	now = Date.now(),
) {
	const time = BigInt(now);
	const expires = time + BigInt(limit.windowMs);
	// The upsert locks the bucket until its decision has been read.
	await tx.$executeRaw`
		INSERT INTO slender_login_limits (bucket, attempts, expires_at)
		VALUES (${bucket}, 1, ${expires})
		ON DUPLICATE KEY UPDATE
			attempts = IF(expires_at <= ${time}, 1, LEAST(attempts + 1, ${limit.max + 1})),
			expires_at = IF(expires_at <= ${time}, ${expires}, expires_at)
	`;
	const record = await tx.loginAttemptBucket.findUniqueOrThrow({
		where: { bucket },
	});
	return record.attempts <= limit.max;
}

export function deleteExpiredLoginBuckets(
	database: PrismaClient,
	now = Date.now(),
) {
	return database.$executeRaw`
		DELETE FROM slender_login_limits
		WHERE expires_at <= ${BigInt(now)}
		ORDER BY expires_at
		LIMIT 500
	`;
}
