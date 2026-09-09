import { loadOnlinePlayers } from '$lib/server/online-players';
import { isOrder, isSort } from '$lib/sorting';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const requestedSort = url.searchParams.get('sort');
	const requestedOrder = url.searchParams.get('order');
	const sort = isSort(requestedSort) ? requestedSort : 'name';
	const order = isOrder(requestedOrder) ? requestedOrder : 'asc';

	return {
		title: "Who's online?",
		characters: await loadOnlinePlayers(sort, order),
		sort,
		order,
	};
}) satisfies PageServerLoad;
