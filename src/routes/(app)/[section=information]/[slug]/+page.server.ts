import { error } from '@sveltejs/kit';

import { informationPageForPath, manualSections } from '$lib/information';
import { loadInformationPresentation } from '$lib/server/theme-assets/information';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	const informationPage = informationPageForPath(url.pathname);
	if (!informationPage) throw error(404, 'Page not found');
	const { selectedTheme } = await parent();
	const section =
		informationPage.id === 'manual' ? url.searchParams.get('section') : null;
	if (section && !manualSections.includes(section))
		throw error(404, 'Manual section not found');
	const presentation = await loadInformationPresentation(
		selectedTheme,
		section ? `manual-${section}` : informationPage.id,
	);
	return {
		title: informationPage.title,
		informationPage: {
			...informationPage,
			minimumBodyWidth:
				presentation?.minimumBodyWidth ?? informationPage.minimumBodyWidth,
		},
		informationPresentation: presentation,
	};
};
