import { redirect } from '@sveltejs/kit';
import { loadFlashMessage } from 'sveltekit-flash-message/server';

import { AccountType } from '$lib/accounts';
import { dailyScreenshot } from '$lib/gallery';
import { PlayerGroup } from '$lib/players';
import { loadBoostedSelections } from '$lib/server/boosted';
import { siteLinks, themeSwitcherEnabled } from '$lib/server/config';
import { diagnosticStep } from '$lib/server/diagnostics';
import { featuredFansite } from '$lib/server/directories';
import { dbToPlayer, PlayerSelectForList } from '$lib/server/players';
import { currentPoll } from '$lib/server/polls';
import { prisma } from '$lib/server/prisma';
import { loadInformationPresentation } from '$lib/server/theme-assets/information';
import {
	loadThemeAssetMetadata,
	resolveThemeId,
} from '$lib/server/theme-assets/manifest';
import { loadPresentationReference } from '$lib/server/theme-assets/presentation-reference';
import {
	resolveThemeSelection,
	themeCookie,
} from '$lib/server/theme-assets/selection';
import { parseTimeString } from '$lib/server/utils';
import { serverName } from '$lib/server/worlds';
import { themeAssetPack } from '$lib/themes/profiles';

import { env } from '$env/dynamic/private';
import { SERVER_SAVE_TIME } from '$env/static/private';

import type { LayoutServerLoad } from './$types';

export const load = loadFlashMessage(async ({ locals, url, cookies }) => {
	const { selectedTheme, redirectTo, preferenceUpdate } =
		await resolveThemeSelection(
			{
				configuredTheme: env.SLENDER_THEME,
				allowSwitching: themeSwitcherEnabled,
				preference: cookies.get(themeCookie),
				url,
			},
			resolveThemeId,
		);
	if (preferenceUpdate === null) {
		cookies.delete(themeCookie, { path: '/' });
	} else if (preferenceUpdate) {
		cookies.set(themeCookie, preferenceUpdate, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: url.protocol === 'https:',
		});
	}
	if (redirectTo) throw redirect(307, redirectTo);

	const nextServerSave = parseTimeString(SERVER_SAVE_TIME || '00:00:00');
	const isAdmin = locals.session?.type === AccountType.God;
	const accountId = locals.session?.accountId;
	const [
		highscores,
		{ boostedBoss, boostedCreature },
		staticPages,
		accountCharacters,
		serverIdentityAssetMetadata,
		themeAssetMetadata,
		informationPresentation,
		selectedFansite,
		selectedPoll,
		selectedServerName,
		classicPresentation,
	] = await Promise.all([
		diagnosticStep('layout.highscores', () =>
			prisma.players.findMany({
				where: { group_id: { lt: PlayerGroup.Gamemaster }, deletion: 0 },
				select: PlayerSelectForList,
				orderBy: { experience: 'desc' },
				take: 5,
			}),
		),
		diagnosticStep('database.boosted', () => loadBoostedSelections()),
		diagnosticStep('layout.pages', () =>
			prisma.staticPage.findMany({
				where: {
					hide: false,
					NOT: [
						{ slug: { startsWith: 'genesis-' } },
						{ slug: { equals: 'fankit' } },
						{ slug: { equals: 'soundtrack' } },
						{ slug: { equals: 'maps' } },
					],
				},
				orderBy: { order: 'asc' },
			}),
		),
		accountId
			? diagnosticStep('layout.account-characters', () =>
					prisma.players.findMany({
						where: { account_id: accountId },
						select: PlayerSelectForList,
					}),
				)
			: Promise.resolve(null),
		diagnosticStep('layout.identity-assets', () =>
			loadThemeAssetMetadata('classic'),
		),
		diagnosticStep('layout.assets', () => {
			const chromePack = themeAssetPack(selectedTheme, 'chromePack');
			return chromePack
				? loadThemeAssetMetadata(chromePack)
				: Promise.resolve({ assets: {}, version: null, warning: null });
		}),
		diagnosticStep('layout.gallery', () =>
			loadInformationPresentation('classic', 'screenshots'),
		),
		diagnosticStep('layout.fansite', () => featuredFansite()),
		diagnosticStep('layout.poll', () => currentPoll()),
		diagnosticStep('layout.server-name', () => serverName()),
		diagnosticStep('layout.presentation', () =>
			loadPresentationReference(selectedTheme),
		),
	]);
	const screenshotGallery = informationPresentation?.gallery ?? null;

	return {
		siteLinks,
		featuredFansite: selectedFansite,
		currentPoll: selectedPoll,
		serverName: selectedServerName,
		serverLogo: serverIdentityAssetMetadata.assets.serverLogo ?? null,
		accountStatusAssets: {
			rewardCollected:
				serverIdentityAssetMetadata.assets.accountRewardCollected ?? null,
			rewardUncollected:
				serverIdentityAssetMetadata.assets.accountRewardUncollected ?? null,
			characterHidden:
				serverIdentityAssetMetadata.assets.accountCharacterHidden ?? null,
		},
		screenshotGallery,
		featuredScreenshot: dailyScreenshot(screenshotGallery?.items ?? []),
		classicPresentation,
		highscores: highscores.map(dbToPlayer),
		boostedBoss,
		boostedCreature,
		isLoggedIn: Boolean(locals.session),
		isAdmin,
		staticPages,
		accountCharacters: accountCharacters?.map(dbToPlayer),
		nextServerSave,
		selectedTheme,
		themeSwitcherEnabled,
		themeAssets: themeAssetMetadata.assets,
		themeAssetWarning: isAdmin ? themeAssetMetadata.warning : null,
	};
}) satisfies LayoutServerLoad;
