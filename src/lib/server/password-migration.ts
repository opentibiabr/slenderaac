import { createHash } from 'node:crypto';

import type { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';

export const BCRYPT_ROUNDS = 12;

export function hashPasswordSHA1(password: string) {
	return createHash('sha1').update(password).digest('hex');
}

export async function rehashLegacyPassword(
	account: { id: number; password: string },
	password: string,
	updateMany: (args: Prisma.AccountsUpdateManyArgs) => PromiseLike<unknown>,
): Promise<void> {
	// bcrypt only uses the first 72 bytes. Preserve longer SHA-1 passwords
	// until the owner chooses a replacement that bcrypt can represent.
	if (
		Buffer.byteLength(password, 'utf8') > 72 ||
		account.password !== hashPasswordSHA1(password)
	) {
		return;
	}

	await updateMany({
		where: { id: account.id, password: account.password },
		data: { password: await hash(password, BCRYPT_ROUNDS) },
	});
}
