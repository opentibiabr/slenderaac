import { redirect } from '@sveltejs/kit';

import { directoryEditorValues, directoryInput } from '$lib/directories';
import { communityFormFailure } from '$lib/server/community-forms';
import { checkDirectoryCharacter } from '$lib/server/directories';
import { prisma } from '$lib/server/prisma';

import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const input = directoryInput(data);
		if (!input)
			return communityFormFailure(
				400,
				{
					global: [
						'Enter a name, an HTTP(S) website and valid directory details. Resellers need at least one country code.',
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
		const entry = await prisma.directoryEntry.create({ data: input });
		throw redirect(303, `/admin/directories/${entry.id}`);
	},
} satisfies Actions;
