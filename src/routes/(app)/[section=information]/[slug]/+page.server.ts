import { error } from '@sveltejs/kit';

import { informationPageForPath } from '$lib/information';
import { loadInformationPresentation } from '$lib/server/theme-assets/information';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	const informationPage = informationPageForPath(url.pathname);
	if (!informationPage) throw error(404, 'Page not found');
	const { selectedTheme } = await parent();
	return {
		title: informationPage.title,
		informationPage,
		informationPresentation: await loadInformationPresentation(
			selectedTheme,
			informationPage.id,
		),
	};
};
