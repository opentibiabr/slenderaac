import { compareSync, hashSync } from 'bcrypt';
import { createHash } from 'crypto';

import {
	ALLOW_LEGACY_SHA1_PASSWORDS,
	DEPRECATED_USE_SHA1_PASSWORDS,
} from '$env/static/private';

const BCRYPT_ROUNDS = 12;

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
 * Hashes a password with SHA1.
 * @param password The password to hash.
 * @returns The hashed password.
 * @deprecated SHA1 is insecure, use bcrypt instead.
 * @see hashPassword
 */
function hashPasswordSHA1(password: string) {
	return createHash('sha1').update(password).digest('hex');
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
