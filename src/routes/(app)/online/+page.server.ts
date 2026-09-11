import { loadOnlinePlayers } from '$lib/server/online-players';
import { serverReachable } from '$lib/server/server-status';
import { isOrder, isSort } from '$lib/sorting';

import { SERVER_ADDRESS, SERVER_PORT } from '$env/static/private';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const requestedSort = url.searchParams.get('sort');
	const requestedOrder = url.searchParams.get('order');
	const sort = isSort(requestedSort) ? requestedSort : 'name';
	const order = isOrder(requestedOrder) ? requestedOrder : 'asc';
	const [serverOnline, characters] = await Promise.all([
		serverReachable(SERVER_ADDRESS, SERVER_PORT),
		loadOnlinePlayers(sort, order),
	]);

	return {
		title: "Who's online?",
		serverOnline,
		characters,
		sort,
		order,
	};
}) satisfies PageServerLoad;
