import { error } from '@sveltejs/kit';

import { houseFilters, selectHouses } from '$lib/houses';
import { loadHouses } from '$lib/server/houses';
import { serverName } from '$lib/server/worlds';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const [houses, world] = await Promise.all([loadHouses(), serverName()]);
	const selectedWorld = url.searchParams.get('world');
	if (selectedWorld && selectedWorld.toLowerCase() !== world.toLowerCase())
		throw error(404, 'World not found');
	const towns = [...new Set(houses.map((house) => house.town))].sort((a, b) =>
		a.localeCompare(b, 'en'),
	);
	const filters = houseFilters(url.searchParams, towns);
	const id = url.searchParams.get('houseid');
	const house =
		id && /^\d+$/.test(id)
			? houses.find((house) => house.id === Number(id))
			: undefined;
	if (id !== null && !house) throw error(404, 'House not found');
	return {
		title: 'Houses',
		world,
		towns,
		filters,
		searched: Boolean(selectedWorld),
		houses: selectedWorld && !house ? selectHouses(houses, filters) : [],
		house: house ?? null,
	};
}) satisfies PageServerLoad;
