import { randomInt } from 'node:crypto';

import type { Prisma } from '@prisma/client';

import { errorCode, log } from '$lib/server/logging';
import {
	deleteExpiredLoginBuckets,
	LOGIN_LIMITS,
	reserveLoginAttempt,
	sourceBucket,
	takeLoginAttempt,
} from '$lib/server/login-rate-limit';
import { prisma } from '$lib/server/prisma';

export async function allowLoginAttempt(
	stage: 'source',
	subject: () => string,
): Promise<boolean>;
export async function allowLoginAttempt(
	stage: 'password' | 'factor',
	subject: number,
	tx?: Prisma.TransactionClient,
): Promise<boolean>;
export async function allowLoginAttempt(
	stage: keyof typeof LOGIN_LIMITS,
	subject: number | (() => string),
	tx?: Prisma.TransactionClient,
): Promise<boolean> {
	const bucket =
		typeof subject === 'function'
			? sourceBucket(subject)
			: `${stage}:${subject}`;
	try {
		const limit = LOGIN_LIMITS[stage];
		const allowed = tx
			? await reserveLoginAttempt(tx, bucket, limit)
			: await takeLoginAttempt(prisma, bucket, limit);
		if (stage === 'source' && randomInt(256) === 0) {
			void deleteExpiredLoginBuckets(prisma).catch((error) => {
				log('warn', 'login.limits.cleanup', `failed code=${errorCode(error)}`);
			});
		}
		return allowed;
	} catch (error) {
		log(
			'error',
			'login.limits',
			`stage=${stage} failed code=${errorCode(error)}`,
		);
		return false;
	}
}
