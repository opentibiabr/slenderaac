import { redirect } from '@sveltejs/kit';

import { saveHelpEntry } from '$lib/server/help';

import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const result = await saveHelpEntry(await request.formData());
		if ('saved' in result) throw redirect(303, `/admin/help/${result.saved}`);
		return result;
	},
} satisfies Actions;
