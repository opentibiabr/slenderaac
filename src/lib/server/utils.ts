import { compareSync, hashSync } from 'bcrypt';

import { requireEmailVerification } from '$lib/server/config';
import { errorCode, log } from '$lib/server/logging';
import {
	BCRYPT_ROUNDS,
	hashPasswordSHA1,
	rehashLegacyPassword,
} from '$lib/server/password-migration';
import { prisma } from '$lib/server/prisma';

import { env } from '$env/dynamic/private';
import {
	ALLOW_LEGACY_SHA1_PASSWORDS,
	DEPRECATED_USE_SHA1_PASSWORDS,
} from '$env/static/private';

/**
 * Hashes a password.
 * @param password The password to hash.
 * @returns The hashed password.
 */
export function hashPassword(password: string) {
	if (DEPRECATED_USE_SHA1_PASSWORDS === 'true') {
		return hashPasswordSHA1(password);
	}
	return hashSync(password, BCRYPT_ROUNDS);
}

/**
 * Compares a password with a hash.
 * @param password The password to compare.
 * @param hash The hash to compare.
 * @returns Whether the password matches the hash.
 */
export function comparePassword(password: string, hash: string) {
	if (
		(DEPRECATED_USE_SHA1_PASSWORDS === 'true' ||
			ALLOW_LEGACY_SHA1_PASSWORDS === 'true') &&
		hash === hashPasswordSHA1(password)
	) {
		return true;
	}
	return compareSync(password, hash);
}

/** Call only after all login checks pass and the session has been created. */
export async function migrateAuthenticatedPassword(
	account: { id: number; password: string; is_verified: boolean },
	password: string,
): Promise<void> {
	if (
		env.UPGRADE_LEGACY_SHA1_PASSWORDS !== 'true' ||
		ALLOW_LEGACY_SHA1_PASSWORDS !== 'true' ||
		DEPRECATED_USE_SHA1_PASSWORDS === 'true' ||
		(requireEmailVerification && !account.is_verified)
	) {
		return;
	}

	try {
		await rehashLegacyPassword(account, password, (args) =>
			prisma.accounts.updateMany(args),
		);
	} catch (error) {
		log('warn', 'password.migration', `failed code=${errorCode(error)}`);
	}
}

/**
 * Parses a time string ("00:00:00") into a Date object of next time that time will elapse in UTC.
 * @param timeString The time string to parse.
 * @returns UTC timestamp of next time that time will elapse.
 */
export function parseTimeString(timeString: string) {
	const [hours, minutes, seconds] = timeString.split(':').map(Number);
	const now = new Date();
	const next = new Date(now);
	next.setUTCHours(hours, minutes, seconds, 0);
	if (next.getTime() < now.getTime()) {
		next.setUTCDate(next.getUTCDate() + 1);
	}
	return next.getTime();
}
