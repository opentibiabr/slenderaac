import { prisma } from '$lib/server/prisma';

import type { PageServerLoad } from './$types';

export const load = (async () => ({
	forms: await prisma.feedbackForm.findMany({
		include: { _count: { select: { responses: true } } },
		orderBy: [{ starts_at: 'desc' }, { id: 'asc' }],
	}),
})) satisfies PageServerLoad;
