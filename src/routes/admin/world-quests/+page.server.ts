import { prisma } from '$lib/server/prisma';

import type { PageServerLoad } from './$types';

export const load = (async () => ({
	title: 'World Quests',
	quests: await prisma.worldQuest.findMany({
		orderBy: [{ sort_order: 'asc' }, { name: 'asc' }, { id: 'asc' }],
		include: { _count: { select: { events: true, results: true } } },
	}),
})) satisfies PageServerLoad;
