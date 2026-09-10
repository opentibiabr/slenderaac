import { error, redirect } from '@sveltejs/kit';

import { boostedCatalogEntry, creatureCatalog } from '$lib/creatures';
import { informationPageForPath, manualSections } from '$lib/information';
import { loadCreatures } from '$lib/server/catalog';
import { loadInformationPresentation } from '$lib/server/theme-assets/information';
import { loadThemeAssetMetadata } from '$lib/server/theme-assets/manifest';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	if (url.pathname.replace(/\/$/, '') === '/about/what-is-tibia')
		throw redirect(308, `/about/server${url.search}`);
	const informationPage = informationPageForPath(url.pathname);
	if (!informationPage) throw error(404, 'Page not found');
	const {
		selectedTheme,
		boostedCreature,
		boostedBoss,
		serverName,
		screenshotGallery,
	} = await parent();
	const title =
		informationPage.id === 'server'
			? `About ${serverName}`
			: informationPage.title;
	const section =
		informationPage.id === 'manual' ? url.searchParams.get('section') : null;
	if (section && !manualSections.includes(section))
		throw error(404, 'Manual section not found');
	const isLibrary = informationPage.section === 'library';
	const boss = informationPage.id === 'boostablebosses';
	const entries = isLibrary ? creatureCatalog(await loadCreatures(), boss) : [];
	const race = isLibrary ? url.searchParams.get('race') : null;
	const selected = race
		? (entries.find(
				(entry) => entry.id === race || entry.aliases?.includes(race),
			) ?? null)
		: null;
	if (race && (!selected || boss)) throw error(404, 'Creature not found');
	const boosted = boss ? boostedBoss : boostedCreature;
	const boostedEntry = boostedCatalogEntry(
		entries,
		boosted?.boostname ?? null,
		Number(boosted?.raceid),
		boss,
	);
	const presentation = isLibrary
		? null
		: await loadInformationPresentation(
				selectedTheme,
				section ? `manual-${section}` : informationPage.id,
			);
	const artwork =
		isLibrary && selectedTheme !== 'classic'
			? Object.fromEntries(
					Object.entries(
						(await loadThemeAssetMetadata('classic')).assets,
					).filter(
						([key]) =>
							key.startsWith('creatureIcon-') ||
							['catalogPrevious', 'catalogNext', 'catalogBack'].includes(key),
					),
				)
			: null;
	return {
		title,
		gallery: informationPage.id === 'screenshots' ? screenshotGallery : null,
		informationPage: {
			...informationPage,
			title,
			minimumBodyWidth:
				presentation?.minimumBodyWidth ?? informationPage.minimumBodyWidth,
		},
		informationPresentation: presentation,
		library: isLibrary
			? {
					entries: entries.map(({ id, name }) => ({ id, name })),
					selected,
					artwork,
					boosted: {
						name: boosted?.boostname ?? null,
						id: boostedEntry?.id ?? null,
						outfit: boosted,
					},
				}
			: null,
	};
};
