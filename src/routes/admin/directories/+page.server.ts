import { prisma } from '$lib/server/prisma';

import type { PageServerLoad } from './$types';

export const load = (async () => ({
	entries: await prisma.directoryEntry.findMany({
		orderBy: [{ kind: 'asc' }, { name: 'asc' }, { id: 'asc' }],
	}),
})) satisfies PageServerLoad;
