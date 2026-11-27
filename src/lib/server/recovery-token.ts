import { createHash, randomBytes } from 'node:crypto';

export const recoveryPageHeaders = {
	'cache-control': 'no-store',
	'referrer-policy': 'no-referrer',
};

export function recoveryTokenDigest(token: unknown) {
	if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return;
	return createHash('sha256').update(token).digest('hex');
}

export function accountRecoveryFingerprint(account: {
	email: string;
	password: string;
	token_secret: string | null;
}) {
	return createHash('sha256')
		.update(
			JSON.stringify([account.email, account.password, account.token_secret]),
		)
		.digest('hex');
}

export function newRecoveryToken() {
	const token = randomBytes(32).toString('base64url');
	return { token, digest: createHash('sha256').update(token).digest('hex') };
}

export function recoveryLink(path: string, token: string) {
	return path + '?' + new URLSearchParams({ token });
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ORIGINS = 4096;
const originAttempts = new Map<string, { count: number; until: number }>();

export function allowRecoveryRequest(
	purpose: string,
	getClientAddress: () => string,
	limit: number,
) {
	let address: string;
	try {
		address = getClientAddress();
	} catch {
		address = 'unknown';
	}
	// Without a trusted client address, a local proxy shares one bounded bucket.
	const sharedAddress =
		address === 'unknown' ||
		address === '::1' ||
		/^(?:::ffff:)?127\./i.test(address);
	const effectiveLimit = sharedAddress ? Math.max(120, limit) : limit;
	const key = purpose + ':' + address;
	const now = Date.now();
	const current = originAttempts.get(key);
	if (current && current.until > now) {
		if (current.count >= effectiveLimit) return false;
		current.count++;
		return true;
	}

	if (originAttempts.size >= MAX_ORIGINS) {
		for (const [origin, attempts] of originAttempts) {
			if (attempts.until <= now) originAttempts.delete(origin);
		}
		if (originAttempts.size >= MAX_ORIGINS) return false;
	}
	originAttempts.set(key, { count: 1, until: now + WINDOW_MS });
	return true;
}
