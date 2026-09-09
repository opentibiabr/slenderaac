import { error } from '@sveltejs/kit';

import { publicQuest, publicQuests } from '$lib/server/world-quests';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const selected = url.searchParams.get('worldquest');
	const quest =
		selected === null ? null : await publicQuest(selected, url.searchParams);
	if (selected !== null && !quest) throw error(404, 'World quest not found');
	return {
		title: 'World Quests',
		quest,
		quests: quest ? [] : await publicQuests(),
	};
}) satisfies PageServerLoad;
