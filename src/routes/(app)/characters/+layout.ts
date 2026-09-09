import { redirect } from '@sveltejs/kit';

import type { Player } from '$lib/players';
import { themePreviewHref } from '$lib/themes/preview';

import type { LayoutLoad } from './$types';

export const load = (async ({ url, fetch }) => {
	const title = 'Characters';
	const name = url.searchParams.get('name')?.trim();
	if (name && url.pathname.replace(/\/$/, '') === '/characters')
		throw redirect(
			303,
			themePreviewHref(url, `/characters/${encodeURIComponent(name)}`),
		);
	const search = url.searchParams.get('search');
	if (!search || search.length < 1) {
		return { title };
	}

	const response = await fetch(`/api/search/characters?q=${search}`);
	const data = (await response.json()) as { results: Player[] };

	return {
		title,
		...data,
	};
}) satisfies LayoutLoad;
