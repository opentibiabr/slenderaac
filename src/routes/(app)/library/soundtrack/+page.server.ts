import { prisma } from '$lib/server/prisma';
import { loadSoundtrackCatalog } from '$lib/server/soundtrack';

import { env } from '$env/dynamic/private';

import type { PageServerLoad } from './$types';

export const load = (async () => {
	const [staticPage, catalog] = await Promise.all([
		prisma.staticPage.findUnique({
			where: { slug: 'soundtrack' },
			select: { content: true },
		}),
		loadSoundtrackCatalog(env.SOUNDTRACK_ASSETS_ROOT),
	]);
	return {
		title: 'Soundtrack',
		content: staticPage?.content ?? null,
		catalog: catalog
			? {
					tracks: catalog.tracks.map((track) => ({
						id: track.id,
						title: track.title,
						audioHref: track.audio
							? `/library/soundtrack/media/${encodeURIComponent(track.id)}/audio`
							: null,
						imageHref: track.image
							? `/library/soundtrack/media/${encodeURIComponent(track.id)}/image`
							: null,
					})),
					archive: catalog.archive
						? { name: catalog.archive.name, size: catalog.archive.size }
						: null,
				}
			: null,
	};
}) satisfies PageServerLoad;
