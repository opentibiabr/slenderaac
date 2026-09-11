import { redirect } from '@sveltejs/kit';

import {
	legalDestination,
	legalDocuments,
} from '$lib/server/support-documents';
import { loadThemeAssetMetadata } from '$lib/server/theme-assets/manifest';
import { themePreviewHref } from '$lib/themes/preview';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const selected = url.searchParams.get('page');
	if (selected)
		throw redirect(303, themePreviewHref(url, legalDestination(selected)));
	return {
		title: 'Legal Documents',
		documents: legalDocuments,
		bullet: (await loadThemeAssetMetadata('classic')).assets.documentBullet,
	};
}) satisfies PageServerLoad;
