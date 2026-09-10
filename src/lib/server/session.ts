import { type Cookies, redirect } from '@sveltejs/kit';
import invariant from 'tiny-invariant';

import { AccountType, isAccountType } from '$lib/accounts';
import { prisma } from '$lib/server/prisma';

export type SessionInfo = {
	accountId: number;
	email: string;
	// Refresh authorization-sensitive account fields at the action boundary.
	type: AccountType;
	expires: number;
};
type Sid = string;

export async function performLogin(cookies: Cookies, email: string) {
	const maxAgeSeconds = 60 * 60 * 24 * 30; // 30 days
	const sid = await createSession(email, maxAgeSeconds);
	cookies.set('sid', sid, { path: '/', maxAge: maxAgeSeconds });
}

export async function createSession(
	email: string,
	maxAgeSeconds: number,
): Promise<string> {
	const account = await prisma.accounts.findUnique({
		where: { email },
	});
	invariant(account, 'Account not found');
	invariant(isAccountType(account.type), 'Invalid account type');

	const expiresAt = Date.now() + maxAgeSeconds * 1000;
	const session = await prisma.accountSessions.create({
		data: {
			account_id: account.id,
			expires: expiresAt,
		},
	});
	return session.id;
}

export async function deleteSession(sid: Sid) {
	await prisma.accountSessions.deleteMany({ where: { id: sid } });
}

export async function getSession(sid: Sid): Promise<SessionInfo | undefined> {
	const session = await prisma.accountSessions.findUnique({
		where: { id: sid },
		include: { account: { select: { id: true, email: true, type: true } } },
	});

	if (session) {
		const expires = Number(session.expires);
		if (Date.now() > expires) {
			await deleteSession(sid);
			return undefined;
		} else {
			const sessionInfo: SessionInfo = {
				accountId: session.account.id,
				email: session.account.email,
				type: session.account.type,
				expires,
			};
			return sessionInfo;
		}
	} else {
		return undefined;
	}
}

const cleanInterval = 1000 * 60 * 60; // 1 hour
async function clean() {
	await prisma.accountSessions.deleteMany({
		where: { expires: { lt: Date.now() } },
	});
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
