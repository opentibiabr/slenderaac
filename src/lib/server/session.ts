import { createHash, randomBytes } from 'node:crypto';

import type { Prisma } from '@prisma/client';
import { type Cookies, redirect } from '@sveltejs/kit';
import invariant from 'tiny-invariant';

import { AccountType, isAccountType } from '$lib/accounts';
import { errorCode, startLogOperation } from '$lib/server/logging';
import { prisma } from '$lib/server/prisma';

export type SessionInfo = {
	accountId: number;
	email: string;
	// Refresh authorization-sensitive account fields at the action boundary.
	type: AccountType;
	expires: number;
};
type Sid = string;

export const WEB_SESSION_COOKIE = 'sid';
const webSessionCookieOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax',
} as const;
const webSessionMaxAgeSeconds = 60 * 60 * 24 * 30;

function webSessionId(sid: Sid) {
	if (sid.length !== 46 || !/^v2\.[A-Za-z0-9_-]{43}$/.test(sid)) return;
	return `v2:${createHash('sha256').update(sid).digest('hex')}`;
}

export function setWebSessionCookie(cookies: Cookies, sid: Sid) {
	cookies.set(WEB_SESSION_COOKIE, sid, {
		...webSessionCookieOptions,
		maxAge: webSessionMaxAgeSeconds,
	});
}

export function clearWebSessionCookie(cookies: Cookies) {
	cookies.delete(WEB_SESSION_COOKIE, webSessionCookieOptions);
}

export async function lockWebSessionAccount(
	client: Prisma.TransactionClient,
	accountId: number,
) {
	await client.$queryRaw`SELECT id FROM accounts WHERE id = ${accountId} FOR UPDATE`;
}

export async function lockActiveWebSession(
	client: Prisma.TransactionClient,
	accountId: number,
	sid: Sid | undefined,
) {
	const id = sid && webSessionId(sid);
	if (!id) return false;

	const [session] = await client.$queryRaw<{ expires: bigint }[]>`
		SELECT expires FROM slender_sessions
		WHERE id = ${id} AND account_id = ${accountId} FOR UPDATE
	`;
	return Boolean(session && session.expires > BigInt(Date.now()));
}

export async function revokeWebSessions(
	client: Prisma.TransactionClient,
	accountId: number,
) {
	await client.accountSessions.deleteMany({ where: { account_id: accountId } });
}

export async function createWebSession(
	client: Prisma.TransactionClient,
	account: { id: number; type: number },
	maxAgeSeconds = webSessionMaxAgeSeconds,
): Promise<string> {
	invariant(isAccountType(account.type), 'Invalid account type');

	const expiresAt = Date.now() + maxAgeSeconds * 1000;
	const sid = `v2.${randomBytes(32).toString('base64url')}`;
	const id = webSessionId(sid);
	invariant(id, 'Invalid generated web session token');
	await client.accountSessions.create({
		data: {
			id,
			account_id: account.id,
			expires: expiresAt,
		},
	});
	return sid;
}

export async function deleteSession(sid: Sid) {
	const id = webSessionId(sid);
	if (id) await prisma.accountSessions.deleteMany({ where: { id } });
}

export async function getSession(sid: Sid): Promise<SessionInfo | undefined> {
	const id = webSessionId(sid);
	if (!id) return;
	const session = await prisma.accountSessions.findUnique({
		where: { id },
		include: { account: { select: { id: true, email: true, type: true } } },
	});

	if (!session) return;
	const expires = Number(session.expires);
	if (Date.now() >= expires) {
		await deleteSession(sid);
		return;
	}
	return {
		accountId: session.account.id,
		email: session.account.email,
		type: session.account.type,
		expires,
	};
}

const cleanInterval = 1000 * 60 * 60; // 1 hour
async function clean() {
	const finish = startLogOperation('sessions.cleanup');
	try {
		const { count } = await prisma.accountSessions.deleteMany({
			where: { expires: { lte: Date.now() } },
		});
		finish(`completed removed=${count}`);
	} catch (error) {
		// Background maintenance must not escape the request error boundary.
		finish(`failed code=${errorCode(error)}`, 'error');
	}
}

void clean();

setInterval(() => {
	void clean();
}, cleanInterval);

export function requireLogin(
	locals: App.Locals,
	_prefix = '',
	loginHref = '/account/login',
): asserts locals is App.Locals & { session: SessionInfo } {
	if (!locals.session) {
		throw redirect(302, loginHref);
	}
}
