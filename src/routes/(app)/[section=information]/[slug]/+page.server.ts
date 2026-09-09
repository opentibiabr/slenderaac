import { error, redirect } from '@sveltejs/kit';

import { informationPageForPath, manualSections } from '$lib/information';
import { libraryEntries, libraryPortraitForName } from '$lib/library';
import { loadInformationPresentation } from '$lib/server/theme-assets/information';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	if (url.pathname.replace(/\/$/, '') === '/about/what-is-tibia')
		throw redirect(308, `/about/server${url.search}`);
	const informationPage = informationPageForPath(url.pathname);
	if (!informationPage) throw error(404, 'Page not found');
	const { selectedTheme, boostedCreature, boostedBoss, serverName } =
		await parent();
	const title =
		informationPage.id === 'server'
			? `About ${serverName}`
			: informationPage.title;
	const section =
		informationPage.id === 'manual' ? url.searchParams.get('section') : null;
	if (section && !manualSections.includes(section))
		throw error(404, 'Manual section not found');
	const presentation = await loadInformationPresentation(
		informationPage.section === 'library' ? 'classic' : selectedTheme,
		section ? `manual-${section}` : informationPage.id,
	);
	const entries =
		informationPage.section === 'library' && presentation
			? libraryEntries(presentation)
			: [];
	const race =
		informationPage.section === 'library' ? url.searchParams.get('race') : null;
	const selectedIndex = race
		? entries.findIndex((entry) => entry.race === race)
		: -1;
	if (race && presentation && selectedIndex < 0)
		throw error(404, 'Creature not found');
	const boosted =
		informationPage.id === 'boostablebosses' ? boostedBoss : boostedCreature;
	const boostedEntry = entries.find(
		(entry) => entry.name.toLowerCase() === boosted?.boostname?.toLowerCase(),
	);
	return {
		title,
		informationPage: {
			...informationPage,
			title,
			minimumBodyWidth:
				presentation?.minimumBodyWidth ?? informationPage.minimumBodyWidth,
		},
		informationPresentation: presentation,
		libraryBoosted:
			informationPage.section === 'library'
				? {
						name: boosted?.boostname ?? null,
						entry: boostedEntry ?? null,
						image:
							presentation && boosted?.boostname
								? libraryPortraitForName(presentation, boosted.boostname)
								: null,
					}
				: null,
		libraryDetail:
			selectedIndex >= 0
				? {
						entry: entries[selectedIndex],
						previous: entries[selectedIndex - 1]?.race ?? null,
						next: entries[selectedIndex + 1]?.race ?? null,
					}
				: null,
	};
};
