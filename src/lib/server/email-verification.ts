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
import { comparePassword } from '$lib/server/utils';

import type { EmailVerification } from '@prisma/client';

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_DELAY_MS = 60 * 1000;

type VerificationMail = {
	email: string;
	kind: 'signup' | 'current' | 'new' | 'notice';
	token?: string;
};

export function newInitialEmailVerification(email: string) {
	const target = newRecoveryToken();
	return {
		data: {
			current_email: email,
			current_approved: true,
			target_digest: target.digest,
			expires: new Date(Date.now() + VERIFY_TTL_MS),
		},
		mail: {
			email,
			kind: 'signup',
			token: target.token,
		} satisfies VerificationMail,
	};
}

export async function sendEmailVerificationLinks(
	messages: readonly VerificationMail[],
) {
	const delivered = await Promise.all(
		messages.map(async ({ email, kind, token }) => {
			const title = {
				signup: 'Verify your account email',
				current: 'Approve your email change',
				new: 'Confirm your new email address',
				notice: 'An email change was requested',
			}[kind];
			try {
				await sendMail(email, {
					subject: title,
					props: {
						title,
						buttonText: token ? 'Continue' : 'Sign in',
						href: token
							? recoveryLink('/account/verify', token)
							: '/account/login',
						previewText: title,
						paragraphs: [
							token
								? 'Use this link before the confirmation request expires.'
								: 'Your new address needs to be verified before the change takes effect.',
							'If you did not make this request, contact support.',
						],
					},
				});
				return true;
			} catch {
				log('warn', 'account.email-verification', 'delivery failed');
				return false;
			}
		}),
	);
	return delivered.every(Boolean);
}

function isCurrent(
	intent: EmailVerification,
	account: { email: string; password: string; token_secret: string | null },
) {
	return (
		intent.expires > new Date() &&
		intent.current_email === account.email &&
		(!intent.new_email ||
			intent.authorization_fingerprint === accountRecoveryFingerprint(account))
	);
}

export async function requestEmailChange(
	accountId: number,
	newEmail: string,
	password: string,
	factor: unknown,
) {
	const snapshot = await prisma.accounts.findUnique({
		where: { id: accountId },
		select: { email: true, password: true },
	});
	if (!snapshot || !comparePassword(password, snapshot.password))
		return { status: 'password' } as const;

	return withLockedAccount(prisma, accountId, async (tx, account) => {
		if (
			!account ||
			account.email !== snapshot.email ||
			account.password !== snapshot.password
		) {
			return { status: 'password' } as const;
		}
		if (
			account.email.toLowerCase() === newEmail ||
			(await tx.accounts.findUnique({
				where: { email: newEmail },
				select: { id: true },
			}))
		) {
			return { status: 'address' } as const;
		}

		const existing = await tx.emailVerification.findUnique({
			where: { account_id: account.id },
		});
		if (
			existing &&
			isCurrent(existing, account) &&
			existing.last_sent.getTime() > Date.now() - RESEND_DELAY_MS
		) {
			return { status: 'cooldown' } as const;
		}
		if (
			account.token_secret &&
			(typeof factor !== 'string' ||
				!(await verifyAccountFactor(tx, account, factor.trim())))
		)
			return { status: 'factor' } as const;

		const target = newRecoveryToken();
		const current =
			account.is_verified && !account.token_secret
				? newRecoveryToken()
				: undefined;
		const now = new Date();
		const data = {
			current_email: account.email,
			new_email: newEmail,
			authorization_fingerprint: accountRecoveryFingerprint(account),
			current_approved: !current,
			current_digest: current?.digest ?? null,
			target_approved: false,
			target_digest: target.digest,
			last_sent: now,
			expires: new Date(now.getTime() + VERIFY_TTL_MS),
		};
		await tx.emailVerification.upsert({
			where: { account_id: account.id },
			create: { account_id: account.id, ...data },
			update: data,
		});
		const mail: VerificationMail[] = [
			{ email: newEmail, kind: 'new', token: target.token },
		];
		if (current)
			mail.push({
				email: account.email,
				kind: 'current',
				token: current.token,
			});
		else if (account.is_verified)
			mail.push({ email: account.email, kind: 'notice' });
		return { status: 'pending', mail } as const;
	});
}

export async function resendEmailVerification(accountId: number) {
	return withLockedAccount(prisma, accountId, async (tx, account) => {
		if (!account) return { status: 'none' } as const;
		const intent = await tx.emailVerification.findUnique({
			where: { account_id: account.id },
		});
		if (!intent || !isCurrent(intent, account)) {
			if (account.is_verified) return { status: 'none' } as const;
			const initial = newInitialEmailVerification(account.email);
			await tx.emailVerification.upsert({
				where: { account_id: account.id },
				create: { account_id: account.id, ...initial.data },
				update: {
					...initial.data,
					new_email: null,
					authorization_fingerprint: null,
					current_digest: null,
					target_approved: false,
					last_sent: new Date(),
				},
			});
			return { status: 'pending', mail: [initial.mail] } as const;
		}

		if (intent.last_sent.getTime() > Date.now() - RESEND_DELAY_MS) {
			return { status: 'cooldown' } as const;
		}
		const current = intent.current_approved ? undefined : newRecoveryToken();
		const target = intent.target_approved ? undefined : newRecoveryToken();
		const mail: VerificationMail[] = [];
		if (current)
			mail.push({
				email: intent.current_email,
				kind: 'current',
				token: current.token,
			});
		if (target)
			mail.push({
				email: intent.new_email ?? intent.current_email,
				kind: intent.new_email ? 'new' : 'signup',
				token: target.token,
			});
		await tx.emailVerification.update({
			where: { id: intent.id },
			data: {
				current_digest: current?.digest ?? null,
				target_digest: target?.digest ?? null,
				last_sent: new Date(),
			},
		});
		return { status: 'pending', mail } as const;
	});
}

async function findEmailVerification(digest: string) {
	const intent = await prisma.emailVerification.findFirst({
		where: {
			OR: [{ current_digest: digest }, { target_digest: digest }],
			expires: { gt: new Date() },
		},
		include: {
			account: { select: { email: true, password: true, token_secret: true } },
		},
	});
	return intent && isCurrent(intent, intent.account) ? intent : null;
}

export async function hasEmailVerification(token: unknown) {
	const digest = recoveryTokenDigest(token);
	return Boolean(digest && (await findEmailVerification(digest)));
}

export async function confirmEmailVerification(token: unknown) {
	const digest = recoveryTokenDigest(token);
	if (!digest) return 'invalid';
	const match = await findEmailVerification(digest);
	if (!match) return 'invalid';

	try {
		return await withLockedAccount<'invalid' | 'pending' | 'confirmed'>(
			prisma,
			match.account_id,
			async (tx, account) => {
				if (!account) return 'invalid';
				const intent = await tx.emailVerification.findUnique({
					where: { account_id: account.id },
				});
				if (!intent || !isCurrent(intent, account)) return 'invalid';
				const confirmsCurrent = intent.current_digest === digest;
				const confirmsTarget = intent.target_digest === digest;
				if (!confirmsCurrent && !confirmsTarget) return 'invalid';

				if (
					!(intent.current_approved || confirmsCurrent) ||
					!(intent.target_approved || confirmsTarget)
				) {
					await tx.emailVerification.update({
						where: { id: intent.id, expires: { gt: new Date() } },
						data: confirmsCurrent
							? { current_approved: true, current_digest: null }
							: { target_approved: true, target_digest: null },
					});
					return 'pending';
				}

				await tx.emailVerification.delete({
					where: { id: intent.id, expires: { gt: new Date() } },
				});
				await tx.accounts.update({
					where: { id: account.id },
					data: { email: intent.new_email ?? account.email, is_verified: true },
				});
				if (intent.new_email)
					await tx.passwordReset.deleteMany({
						where: { account_id: account.id },
					});
				return 'confirmed';
			},
		);
	} catch (cause) {
		if (cause instanceof Prisma.PrismaClientKnownRequestError) {
			if (cause.code === 'P2025') return 'invalid';
			if (cause.code === 'P2002') return 'unavailable';
		}
		throw cause;
	}
}
