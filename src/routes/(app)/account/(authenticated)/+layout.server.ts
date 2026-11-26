import type { AccountCharacter, AccountInfo } from '$lib/accounts';
import { loadAccountRewardStates } from '$lib/server/account-character-status';
import { dbToPlayer, PlayerSelectForList } from '$lib/server/players';
import { prisma } from '$lib/server/prisma';
import { requireLogin } from '$lib/server/session';
import { layoutLoginHref } from '$lib/themes/navigation';

import { FREE_PREMIUM } from '$env/static/private';

import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
	requireLogin(locals, '', layoutLoginHref(url));
	const account = await prisma.accounts.findUniqueOrThrow({
		where: {
			id: locals.session?.accountId,
		},
		select: {
			name: true,
			email: true,
			creation: true,
			lastday: true,
			coins: true,
			coins_transferable: true,
			is_verified: true,
			token_secret: true,
			players: {
				select: { ...PlayerSelectForList, settings: true },
			},
			emailVerification: {
				select: { new_email: true, current_email: true, expires: true },
			},
		},
	});

	const rewards = await loadAccountRewardStates(
		account.players.map((player) => player.id),
	);
	const characters: AccountCharacter[] = account.players.map((player) => ({
		...dbToPlayer(player),
		dailyReward: rewards.get(player.id) ?? 'unknown',
	}));
	const now = Math.trunc(Date.now() / 1000);
	const premiumGranted = FREE_PREMIUM === 'true';
	const pendingEmail = account.emailVerification;
	const accountInfo: AccountInfo = {
		name: account.name,
		email: account.email,
		createdAt: new Date(account.creation * 1000),
		coins: account.coins,
		coinsTransferable: account.coins_transferable,
		isPremium: premiumGranted || account.lastday > now,
		premiumGranted,
		premiumDays:
			account.lastday > now
				? Math.trunc((account.lastday - now) / (24 * 60 * 60))
				: 0,
		premiumExpiresAt:
			account.lastday > 0 ? new Date(account.lastday * 1000) : undefined,
		isVerified: account.is_verified,
		newEmail:
			pendingEmail &&
			pendingEmail.current_email === account.email &&
			pendingEmail.expires > new Date()
				? (pendingEmail.new_email ?? undefined)
				: undefined,
		is2faEnabled: Boolean(account.token_secret),
		lastLogin: new Date(
			characters.reduce(
				(acc, cur) => Math.max(acc, cur.lastLogin?.getTime() ?? 0),
				0,
			),
		),
	};
	return {
		title: 'Account Management',
		characters,
		account: accountInfo,
	};
}) satisfies LayoutServerLoad;
