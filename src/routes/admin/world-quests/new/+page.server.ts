import { redirect } from '@sveltejs/kit';

import {
	questAdminWrite,
	questFormError,
} from '$lib/server/world-quests-admin';
import { questInput } from '$lib/world-quests';

import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const data = questInput(await request.formData());
		if (!data)
			return questFormError(
				'Enter a valid slug, name, description, kind and display order.',
			);
		const result = await questAdminWrite((tx) =>
			tx.worldQuest.create({ data }),
		);
		if (!('id' in result)) return result;
		throw redirect(303, `/admin/world-quests/${result.id}`);
	},
} satisfies Actions;
