import { prisma } from '$lib/server/prisma';

export async function loadSupportDocument(slug: string, title: string) {
	const document = await prisma.staticPage.findUnique({
		where: { slug },
		select: { title: true, content: true, updated_at: true },
	});
	return { title, document };
}
