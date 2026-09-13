import { redirect } from '@sveltejs/kit';

import { requireLogin } from '$lib/server/session';
import { themePreviewHref, themePreviewLoginHref } from '$lib/themes/preview';

import type { PageServerLoad } from '../$types';

export const load = (({ locals, url }) => {
	requireLogin(locals, '', themePreviewLoginHref(url));

	throw redirect(302, themePreviewHref(url, '/shop/coins'));
}) satisfies PageServerLoad;
