import { redirect } from '@sveltejs/kit';
import { loadFlashMessage } from 'sveltekit-flash-message/server';

import { AccountType } from '$lib/accounts';
import { dailyScreenshot } from '$lib/gallery';
import { PlayerGroup } from '$lib/players';
import { loadBoostedSelections } from '$lib/server/boosted';
import { siteLinks, themeSwitcherEnabled } from '$lib/server/config';
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
	themePreferenceUpdate,
} from '$lib/server/theme-assets/selection';
import { parseTimeString } from '$lib/server/utils';
import { serverName } from '$lib/server/worlds';

import { env } from '$env/dynamic/private';
import { SERVER_SAVE_TIME } from '$env/static/private';

import type { LayoutServerLoad } from './$types';

export const load = loadFlashMessage(async ({ locals, url, cookies }) => {
	const preferenceUpdate = themePreferenceUpdate(themeSwitcherEnabled, url);
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

	const { selectedTheme, redirectTo } = await resolveThemeSelection(
		{
			configuredTheme: env.SLENDER_THEME,
			allowSwitching: themeSwitcherEnabled,
			preference: cookies.get(themeCookie),
			url,
		},
		resolveThemeId,
	);
	if (redirectTo) throw redirect(307, redirectTo);

	const nextServerSave = parseTimeString(SERVER_SAVE_TIME || '00:00:00');
	const isAdmin = locals.session?.type === AccountType.God;
	const [
		highscores,
		{ boostedBoss, boostedCreature },
		staticPages,
		accountCharacters,
		classicAssetMetadata,
		informationPresentation,
		selectedFansite,
		selectedPoll,
		selectedServerName,
		classicPresentation,
	] = await Promise.all([
		prisma.players.findMany({
			where: { group_id: { lt: PlayerGroup.Gamemaster }, deletion: 0 },
			select: PlayerSelectForList,
			orderBy: { experience: 'desc' },
			take: 5,
		}),
		loadBoostedSelections(),
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
		locals.session?.accountId
			? prisma.players.findMany({
					where: { account_id: locals.session.accountId },
					select: PlayerSelectForList,
				})
			: Promise.resolve(null),
		loadThemeAssetMetadata('classic'),
		loadInformationPresentation('classic', 'screenshots'),
		featuredFansite(),
		currentPoll(),
		serverName(),
		loadPresentationReference(selectedTheme),
	]);
	const screenshotGallery = informationPresentation?.gallery ?? null;
	const themeAssetMetadata =
		selectedTheme === 'classic'
			? classicAssetMetadata
			: { assets: {}, version: null, warning: null };

	return {
		siteLinks,
		featuredFansite: selectedFansite,
		currentPoll: selectedPoll,
		serverName: selectedServerName,
		serverLogo: classicAssetMetadata.assets.serverLogo ?? null,
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
