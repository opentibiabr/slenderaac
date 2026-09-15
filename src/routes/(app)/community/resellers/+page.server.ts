import { error } from '@sveltejs/kit';

import { directoryCountry, resellerDirectory } from '$lib/directories';
import { loadDirectory } from '$lib/server/directories';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const country = (url.searchParams.get('country') ?? '').toUpperCase();
	if (country && !directoryCountry(country))
		throw error(400, 'Invalid country code');
	return {
		title: 'Resellers',
		country,
		...resellerDirectory(await loadDirectory('reseller'), country),
	};
}) satisfies PageServerLoad;
