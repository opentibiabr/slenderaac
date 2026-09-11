import { error, redirect } from '@sveltejs/kit';

import { communityFormFailure } from '$lib/server/community-forms';
import { saveHelpEntry } from '$lib/server/help';
import { prisma } from '$lib/server/prisma';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const entry = await prisma.helpEntry.findUnique({ where: { id: params.id } });
	if (!entry) throw error(404, 'Article not found');
	return { title: 'Edit FAQ Article', entry };
}) satisfies PageServerLoad;
export const actions = {
	save: async ({ request, params }) => {
		const result = await saveHelpEntry(await request.formData(), params.id);
		if ('saved' in result) throw redirect(303, `/admin/help/${result.saved}`);
		return result;
	},
	delete: async ({ request, params }) => {
		const data = await request.formData();
		const version = new Date(String(data.get('version') ?? ''));
		if (Number.isNaN(version.getTime()))
			return communityFormFailure(400, {
				global: ['Reload the article before deleting.'],
			});
		const result = await prisma.helpEntry.deleteMany({
			where: { id: params.id, updated_at: version },
		});
		if (!result.count)
			return communityFormFailure(409, {
				global: [
					'This article has changed or was deleted. Reload before deleting.',
				],
			});
		throw redirect(303, '/admin/help');
	},
} satisfies Actions;
