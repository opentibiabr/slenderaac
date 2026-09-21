import { filterFansites } from '$lib/directories';
import { loadDirectory } from '$lib/server/directories';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => ({
	title: 'Fansites',
	entries: filterFansites(await loadDirectory('fansite'), url.searchParams),
})) satisfies PageServerLoad;
