import { redirect } from '@sveltejs/kit';

import { requireLogin } from '$lib/server/session';
import { layoutLoginHref } from '$lib/themes/navigation';

import type { PageServerLoad } from '../$types';

export const load = (({ locals, url }) => {
	requireLogin(locals, '', layoutLoginHref(url));

	throw redirect(302, '/shop/coins');
}) satisfies PageServerLoad;
