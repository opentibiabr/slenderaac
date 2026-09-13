import { error } from '@sveltejs/kit';

import { prisma } from '$lib/server/prisma';

export const legalDocuments = [
	{
		key: 'agreement',
		slug: 'service-agreement',
		title: 'Service Agreement',
		path: '/support/service-agreement',
	},
	{ key: 'rules', slug: 'rules', title: 'Rules', path: '/pages/rules' },
	{
		key: 'privacy',
		slug: 'privacy-policy',
		title: 'Privacy Policy',
		path: '/support/privacy-policy',
	},
];
export async function loadSupportDocument(slug: string, title: string) {
	const document = await prisma.staticPage.findUnique({
		where: { slug },
		select: { title: true, content: true, updated_at: true },
	});
	return { title, document };
}
export function legalDestination(key: string) {
	const document = legalDocuments.find((entry) => entry.key === key);
	if (!document) throw error(404, 'Document not found');
	return document.path;
}
