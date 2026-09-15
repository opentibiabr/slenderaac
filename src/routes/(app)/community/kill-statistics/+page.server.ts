import { error } from '@sveltejs/kit';

import { loadKillStatistics } from '$lib/server/kill-statistics';
import { serverName } from '$lib/server/worlds';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const world = await serverName();
	const selected = url.searchParams.get('world')?.trim() || '';
	if (selected && selected.toLowerCase() !== world.toLowerCase())
		throw error(404, 'World not found');
	return {
		title: 'Kill Statistics',
		world,
		selected: Boolean(selected),
		statistics: selected ? await loadKillStatistics() : null,
	};
}) satisfies PageServerLoad;
