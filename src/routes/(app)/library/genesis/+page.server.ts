import { error } from '@sveltejs/kit';

import { storyChapters, storyPage } from '$lib/genesis';
import { prisma } from '$lib/server/prisma';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const chapters = storyChapters(
		await prisma.staticPage.findMany({
			where: { slug: { startsWith: 'genesis-' } },
			select: { slug: true, title: true, content: true, order: true },
		}),
	);
	const selected = storyPage(url.searchParams.get('page'), chapters.length);
	if (selected === null) throw error(404, 'Story chapter not found');
	return {
		title: 'Genesis',
		chapter: chapters[selected] ?? null,
		previous: selected > 0 ? chapters[selected - 1] : null,
		next: selected + 1 < chapters.length ? chapters[selected + 1] : null,
		page: selected + 1,
	};
}) satisfies PageServerLoad;
