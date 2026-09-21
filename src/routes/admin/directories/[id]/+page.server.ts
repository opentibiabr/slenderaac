import { error, redirect } from '@sveltejs/kit';

import { directoryEditorValues, directoryInput } from '$lib/directories';
import { communityFormFailure } from '$lib/server/community-forms';
import { checkDirectoryCharacter } from '$lib/server/directories';
import { prisma } from '$lib/server/prisma';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const entry = await prisma.directoryEntry.findUnique({
		where: { id: params.id },
	});
	if (!entry) throw error(404, 'Directory entry not found');
	return { entry };
}) satisfies PageServerLoad;

export const actions = {
	save: async ({ params, request }) => {
		const data = await request.formData();
		const input = directoryInput(data);
		const version = new Date(String(data.get('version')));
		if (!input || !Number.isFinite(version.getTime()))
			return communityFormFailure(
				400,
				{
					global: [
						'Enter a name, an HTTP(S) website and valid directory details.',
					],
				},
				directoryEditorValues(data),
			);
		if (!(await checkDirectoryCharacter(input.details.contactCharacter)))
			return communityFormFailure(
				400,
				{ global: ['The contact character does not exist on this server.'] },
				directoryEditorValues(data),
			);
		const updated = await prisma.directoryEntry.updateMany({
			where: { id: params.id, updated_at: version },
			data: input,
		});
		if (!updated.count)
			return communityFormFailure(
				409,
				{
					global: [
						'This entry changed or was deleted. Reload it before saving.',
					],
				},
				directoryEditorValues(data),
			);
		return { saved: true, errors: {} as Record<string, string[]> };
	},
	delete: async ({ params, request }) => {
		const data = await request.formData();
		const version = new Date(String(data.get('version')));
		if (data.get('confirm') !== 'on' || !Number.isFinite(version.getTime()))
			return communityFormFailure(400, {
				global: ['Confirm that you want to remove this entry.'],
			});
		const deleted = await prisma.directoryEntry.deleteMany({
			where: { id: params.id, updated_at: version },
		});
		if (!deleted.count)
			return communityFormFailure(409, {
				global: [
					'This entry changed or was deleted. Reload it before removing it.',
				],
			});
		throw redirect(303, '/admin/directories');
	},
} satisfies Actions;
