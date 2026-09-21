import { publicAchievements } from '$lib/achievements';
import { loadAchievements } from '$lib/server/catalog';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const records = await loadAchievements();
	return {
		title: 'Achievements',
		configured: records.length > 0,
		...publicAchievements(records),
	};
};
