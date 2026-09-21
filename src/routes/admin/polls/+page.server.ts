import { prisma } from '$lib/server/prisma';

import type { PageServerLoad } from './$types';

export const load = (async () => ({
	polls: await prisma.poll.findMany({
		include: { _count: { select: { votes: true } } },
		orderBy: [{ starts_at: 'desc' }, { id: 'asc' }],
	}),
})) satisfies PageServerLoad;
