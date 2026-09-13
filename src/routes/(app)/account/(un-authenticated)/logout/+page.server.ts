import { type Actions, redirect } from '@sveltejs/kit';

import { deleteSession } from '$lib/server/session';

import type { PageServerLoad } from './$types';

export const load = (() => {
	// we only use this endpoint for the api
	// and don't need to see the page
	throw redirect(302, '/');
}) satisfies PageServerLoad;

export const actions: Actions = {
	async default({ cookies }) {
		const sid = cookies.get('sid');
		if (sid) {
			cookies.delete('sid');
			await deleteSession(sid);
		}

		throw redirect(302, '/');
	},
};
