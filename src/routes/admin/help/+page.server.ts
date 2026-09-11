import { prisma } from '$lib/server/prisma';

export const load = async () => ({
	title: 'FAQ Articles',
	entries: await prisma.helpEntry.findMany({
		orderBy: [{ topic: 'asc' }, { title: 'asc' }],
		select: {
			id: true,
			title: true,
			slug: true,
			topic: true,
			published: true,
			featured: true,
			views: true,
		},
	}),
});
