import { type Actions, redirect } from '@sveltejs/kit';

import { deleteSession } from '$lib/server/session';
import { themePreviewHref } from '$lib/themes/preview';

import type { PageServerLoad } from './$types';

export const load = (({ url }) => {
	// we only use this endpoint for the api
	// and don't need to see the page
	throw redirect(302, themePreviewHref(url, '/'));
}) satisfies PageServerLoad;

export const actions: Actions = {
	async default({ cookies, url }) {
		const sid = cookies.get('sid');
		if (sid) {
			cookies.delete('sid');
			await deleteSession(sid);
		}

		throw redirect(302, themePreviewHref(url, '/'));
	},
};
