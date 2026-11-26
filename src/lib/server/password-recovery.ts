import { Prisma } from '@prisma/client';

import {
	verifyAccountFactor,
	withLockedAccount,
} from '$lib/server/account-2fa';
import { sendMail } from '$lib/server/email';
import { log } from '$lib/server/logging';
import { prisma } from '$lib/server/prisma';
import {
	accountRecoveryFingerprint,
	newRecoveryToken,
	recoveryLink,
	recoveryTokenDigest,
} from '$lib/server/recovery-token';
import { comparePassword, hashPassword } from '$lib/server/utils';

const RESET_TTL_MS = 30 * 60 * 1000;
const RESEND_DELAY_MS = 60 * 1000;
const MAX_FACTOR_ATTEMPTS = 6;
const accountFields = { email: true, password: true, token_secret: true };

export async function requestPasswordReset(email: string) {
	const account = await prisma.accounts.findUnique({
		where: { email },
		select: { id: true, email: true },
	});
	if (!account) return;

	const { token, digest } = newRecoveryToken();
	const recipient = await withLockedAccount(
		prisma,
		account.id,
		async (tx, current) => {
			if (!current || current.email !== account.email) return;
			const existing = await tx.passwordReset.findUnique({
				where: { account_id: current.id },
			});
			const now = Date.now();
			if (
				existing?.account_fingerprint === accountRecoveryFingerprint(current) &&
				existing.expires.getTime() > now + RESET_TTL_MS - RESEND_DELAY_MS
			)
				return;

			const data = {
				token: digest,
				account_fingerprint: accountRecoveryFingerprint(current),
				attempts: 0,
				expires: new Date(now + RESET_TTL_MS),
			};
			await tx.passwordReset.upsert({
				where: { account_id: current.id },
				create: { account_id: current.id, ...data },
				update: data,
			});
			return current.email;
		},
	);
	if (!recipient) return;

	try {
		await sendMail(recipient, {
			subject: 'Reset your password',
			props: {
				title: 'Reset your password',
				buttonText: 'Reset Password',
				href: recoveryLink('/account/password-reset', token),
				previewText: 'This password reset link expires in 30 minutes.',
				paragraphs: [
					'Use this link to choose a new password for your account.',
					'If you did not request a password reset, you can safely ignore this email.',
				],
			},
		});
	} catch {
		await prisma.passwordReset.deleteMany({ where: { token: digest } });
		log('warn', 'account.password-reset', 'delivery failed');
	}
}

async function getReset(token: unknown) {
	const digest = recoveryTokenDigest(token);
	if (!digest) return;
	const reset = await prisma.passwordReset.findUnique({
		where: { token: digest },
		include: { account: { select: accountFields } },
	});
	if (
		!reset ||
		reset.expires <= new Date() ||
		reset.attempts >= MAX_FACTOR_ATTEMPTS ||
		reset.account_fingerprint !== accountRecoveryFingerprint(reset.account)
	)
		return;
	return reset;
}

export async function getPasswordResetChallenge(token: unknown) {
	const reset = await getReset(token);
	if (reset) return { factorRequired: Boolean(reset.account.token_secret) };
}

export async function completePasswordReset(
	token: unknown,
	password: string,
	factor: unknown,
) {
	const reset = await getReset(token);
	if (!reset) return { status: 'invalid' } as const;

	try {
		return await withLockedAccount(
			prisma,
			reset.account_id,
			async (tx, account) => {
				if (!account) return { status: 'invalid' } as const;
				const current = await tx.passwordReset.findUnique({
					where: { token: reset.token },
				});
				if (
					!current ||
					current.account_id !== account.id ||
					current.expires <= new Date() ||
					current.attempts >= MAX_FACTOR_ATTEMPTS ||
					current.account_fingerprint !== accountRecoveryFingerprint(account)
				)
					return { status: 'invalid' } as const;

				if (comparePassword(password, account.password))
					return { status: 'same-password' } as const;
				if (account.token_secret) {
					if (typeof factor !== 'string' || !factor.trim())
						return { status: 'factor' } as const;
					if (!(await verifyAccountFactor(tx, account, factor.trim()))) {
						await tx.passwordReset.update({
							where: { token: current.token },
							data: { attempts: { increment: 1 } },
						});
						return { status: 'factor' } as const;
					}
				}
				const hashedPassword = hashPassword(password);
				await tx.passwordReset.delete({
					where: { token: current.token, expires: { gt: new Date() } },
				});
				await tx.accounts.update({
					where: { id: account.id },
					data: { password: hashedPassword },
				});
				await tx.emailVerification.deleteMany({
					where: { account_id: account.id, new_email: { not: null } },
				});
				await tx.accountSessions.deleteMany({
					where: { account_id: account.id },
				});
				await tx.gameAccountSessions.deleteMany({
					where: { account_id: account.id },
				});
				return {
					status: 'updated',
					accountId: account.id,
					email: account.email,
				} as const;
			},
		);
	} catch (cause) {
		if (
			cause instanceof Prisma.PrismaClientKnownRequestError &&
			cause.code === 'P2025'
		) {
			return { status: 'invalid' } as const;
		}
		throw cause;
	}
}

export async function notifyPasswordReset(email: string) {
	try {
		await sendMail(email, {
			subject: 'Your password was reset',
			props: {
				title: 'Your password was reset',
				buttonText: 'Sign in',
				href: '/account/login',
				previewText: 'Your account password was updated.',
				paragraphs: [
					'Your account password was updated. Existing sessions have been revoked.',
					'Contact support if you did not make this change.',
				],
			},
		});
	} catch {
		log('warn', 'account.password-reset', 'notification delivery failed');
	}
}
