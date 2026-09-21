import { error } from '@sveltejs/kit';

import { loadMapCatalog, mapPlaces } from '$lib/server/maps';
import { prisma } from '$lib/server/prisma';

import { env } from '$env/dynamic/private';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const [staticPage, catalog] = await Promise.all([
		prisma.staticPage.findUnique({
			where: { slug: 'maps' },
			select: { content: true },
		}),
		loadMapCatalog(env.MAP_ASSETS_ROOT),
	]);
	const selectedId = url.searchParams.get('area');
	const selected =
		selectedId && catalog
			? mapPlaces(catalog).find((place) => place.id === selectedId)
			: null;
	if (selectedId && catalog && !selected)
		throw error(404, 'Map area not found');

	return {
		title: 'Maps',
		content: staticPage?.content ?? null,
		catalog: catalog
			? {
					sections: catalog.sections.map((section) => ({
						title: section.title,
						groups: section.groups.map((group) => ({
							label: group.label,
							places: group.places.map(({ id, name, x, y }) => ({
								id,
								name,
								x,
								y,
							})),
						})),
					})),
					overviewHref: catalog.overview
						? '/library/maps/media/overview'
						: null,
					highResolution: catalog.highResolution
						? {
								href: '/library/maps/media/download',
								size: catalog.highResolution.size,
							}
						: null,
				}
			: null,
		selected: selected
			? {
					id: selected.id,
					name: selected.name,
					description: selected.description,
					imageHref: selected.image
						? `/library/maps/media/area-${encodeURIComponent(selected.id)}`
						: null,
				}
			: null,
	};
}) satisfies PageServerLoad;
