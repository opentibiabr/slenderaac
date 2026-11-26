import { createHash, randomBytes } from 'node:crypto';

import type { Prisma, PrismaClient } from '@prisma/client';
import { authenticator } from 'otplib';

const TOTP = /^[0-9]{6}$/;
const RECOVERY = /^(?:[0-9a-f]{5}|[0-9a-f]{32})$/i;
export const TWO_FACTOR_SETUP_TTL_MS = 10 * 60 * 1000;

const accountFields = {
	id: true,
	email: true,
	password: true,
	token_secret: true,
	is_verified: true,
	type: true,
} satisfies Prisma.AccountsSelect;
type LockedAccount = Prisma.AccountsGetPayload<{
	select: typeof accountFields;
}>;

export function withLockedAccount<T>(
	database: PrismaClient,
	accountId: number,
	work: (
		tx: Prisma.TransactionClient,
		account: LockedAccount | null,
	) => Promise<T>,
) {
	return database.$transaction(async (tx) => {
		// Serialize factor changes and session issuance for this account.
		const rows = await tx.$queryRaw<{ id: number }[]>`
			SELECT id FROM accounts WHERE id = ${accountId} FOR UPDATE
		`;
		const account = rows.length
			? await tx.accounts.findUnique({
					where: { id: accountId },
					select: accountFields,
				})
			: null;
		return work(tx, account);
	});
}

export function checkAuthenticatorToken(token: unknown, secret: string) {
	return (
		typeof token === 'string' &&
		TOTP.test(token) &&
		authenticator.check(token, secret)
	);
}

function recoveryDigest(code: string) {
	return 'sha256:' + createHash('sha256').update(code).digest('hex');
}

export function newRecoveryCodes() {
	const codes = Array.from({ length: 6 }, () =>
		randomBytes(16).toString('hex'),
	);
	return {
		codes,
		rows: codes.map((code) => ({ code: recoveryDigest(code) })),
	};
}

export async function verifyAccountFactor(
	tx: Prisma.TransactionClient,
	account: Pick<LockedAccount, 'id' | 'token_secret'>,
	token: string,
) {
	if (!account.token_secret) return false;
	if (checkAuthenticatorToken(token, account.token_secret)) return true;
	if (!RECOVERY.test(token)) return false;

	const code = token.toLowerCase();
	const stored = code.length === 5 ? code : recoveryDigest(code);
	const matches = (
		await tx.accountBackupCodes.findMany({
			where: { account_id: account.id, code: stored },
			select: { id: true, code: true, used: true },
		})
	).filter((row) => row.code === stored);

	if (matches.length === 0 || matches.some((row) => row.used)) return false;

	// A legacy batch can contain duplicates. Consume all rows for that value together.
	const result = await tx.accountBackupCodes.updateMany({
		where: {
			account_id: account.id,
			id: { in: matches.map((row) => row.id) },
			used: false,
		},
		data: { used: true },
	});
	return result.count === matches.length;
}
