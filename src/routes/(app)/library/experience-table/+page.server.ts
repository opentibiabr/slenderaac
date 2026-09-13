import { experienceForLevel } from '$lib/experience';
import { featurePages } from '$lib/site-pages';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	title: featurePages.experiencetable.title,
	columns: Array.from({ length: 4 }, (_, column) =>
		Array.from({ length: 875 }, (_, row) => {
			const level = column * 875 + row + 1;
			return { level, experience: experienceForLevel(level).toString() };
		}),
	),
});
