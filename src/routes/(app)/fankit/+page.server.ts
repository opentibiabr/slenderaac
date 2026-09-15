import { loadFankitPackage } from '$lib/server/fankit';
import { prisma } from '$lib/server/prisma';

import { env } from '$env/dynamic/private';

import type { PageServerLoad } from './$types';

export const load = (async () => {
	const [staticPage, archive] = await Promise.all([
		prisma.staticPage.findUnique({
			where: { slug: 'fankit' },
			select: { content: true },
		}),
		loadFankitPackage(env.FANKIT_FILE),
	]);
	return {
		title: 'Fankit',
		content: staticPage?.content ?? null,
		archive: archive
			? {
					name: archive.name,
					size: archive.size,
					modified: archive.modified,
				}
			: null,
	};
}) satisfies PageServerLoad;
