import { redirect } from '@sveltejs/kit';
import { loadFlashMessage } from 'sveltekit-flash-message/server';

import { AccountType } from '$lib/accounts';
import { PlayerGroup } from '$lib/players';
import { dbToPlayer, PlayerSelectForList } from '$lib/server/players';
import { prisma } from '$lib/server/prisma';
import {
	loadThemeAssetMetadata,
	resolveThemeId,
} from '$lib/server/theme-assets/manifest';
import { loadPresentationReference } from '$lib/server/theme-assets/presentation-reference';
import { parseTimeString } from '$lib/server/utils';
import { normalizeTheme } from '$lib/themes/theme-ids';

import { env } from '$env/dynamic/private';
import { SERVER_SAVE_TIME } from '$env/static/private';

import type { LayoutServerLoad } from './$types';

export const load = loadFlashMessage(async ({ locals, url }) => {
	const highscores = await prisma.players.findMany({
		where: { group_id: { lt: PlayerGroup.Gamemaster }, deletion: 0 },
		select: PlayerSelectForList,
		orderBy: { experience: 'desc' },
		take: 5,
	});

	const boostedBoss = await prisma.boostedBoss.findFirst();
	const boostedCreature = await prisma.boostedCreature.findFirst();
	const staticPages = await prisma.staticPage.findMany({
		where: { hide: false },
		orderBy: { order: 'asc' },
	});

	const accountCharacters = locals.session?.accountId
		? await prisma.players.findMany({
				where: { account_id: locals.session.accountId },
				select: PlayerSelectForList,
			})
		: null;

	const nextServerSave = parseTimeString(SERVER_SAVE_TIME || '00:00:00');
	const configuredTheme =
		(await resolveThemeId(env.SLENDER_THEME)) ??
		normalizeTheme(env.SLENDER_THEME);
	const previewTheme = url.searchParams.get('themePreview');
	const resolvedPreview = await resolveThemeId(previewTheme);
	const selectedTheme = resolvedPreview ?? configuredTheme;
	if (resolvedPreview && previewTheme !== resolvedPreview) {
		const canonical = new URL(url);
		canonical.searchParams.set('themePreview', selectedTheme);
		throw redirect(307, canonical.pathname + canonical.search);
	}
	const isAdmin = locals.session?.type === AccountType.God;
	const themeAssetMetadata =
		selectedTheme === 'classic'
			? await loadThemeAssetMetadata(selectedTheme)
			: { assets: {}, version: null, warning: null };

	return {
		classicPresentation: await loadPresentationReference(selectedTheme),
		highscores: highscores.map(dbToPlayer),
		boostedBoss,
		boostedCreature,
		isLoggedIn: Boolean(locals.session),
		isAdmin,
		staticPages,
		accountCharacters: accountCharacters?.map(dbToPlayer),
		nextServerSave,
		selectedTheme,
		themeAssets: themeAssetMetadata.assets,
		themeAssetWarning: isAdmin ? themeAssetMetadata.warning : null,
	};
}) satisfies LayoutServerLoad;
