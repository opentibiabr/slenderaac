import { prisma } from '$lib/server/prisma';

import type { PageServerLoad } from './$types';

export const load = (async () => ({
	title: 'Event Schedule',
	events: await prisma.scheduleEvent.findMany({
		orderBy: [{ starts_at: 'desc' }, { sort_order: 'asc' }, { id: 'asc' }],
	}),
})) satisfies PageServerLoad;
