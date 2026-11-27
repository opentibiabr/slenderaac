import { type Actions, redirect } from '@sveltejs/kit';

import {
	clearWebSessionCookie,
	deleteSession,
	WEB_SESSION_COOKIE,
} from '$lib/server/session';

import type { PageServerLoad } from './$types';

export const load = (() => {
	// we only use this endpoint for the api
	// and don't need to see the page
	throw redirect(302, '/');
}) satisfies PageServerLoad;

export const actions: Actions = {
	async default({ cookies }) {
		const sid = cookies.get(WEB_SESSION_COOKIE);
		if (sid) {
			await deleteSession(sid);
			clearWebSessionCookie(cookies);
		}

		throw redirect(302, '/');
	},
};
