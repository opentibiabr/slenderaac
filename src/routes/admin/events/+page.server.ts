import { schedulePresentation } from '$lib/server/news/schedule';
import { prisma } from '$lib/server/prisma';

import type { PageServerLoad } from './$types';

export const load = (async () => ({
	title: 'Event Schedule',
	events: (
		await prisma.scheduleEvent.findMany({
			include: { world_quest: { select: { name: true, description: true } } },
			orderBy: [{ starts_at: 'desc' }, { sort_order: 'asc' }, { id: 'asc' }],
		})
	).map(schedulePresentation),
})) satisfies PageServerLoad;
