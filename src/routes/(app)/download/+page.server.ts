import { isReferenceWebsite } from '$lib/source-navigation';

import { PUBLIC_DOWNLOAD_URL } from '$env/static/public';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	let downloadHref: string | null = null;
	try {
		const target = new URL(PUBLIC_DOWNLOAD_URL, url);
		if (
			PUBLIC_DOWNLOAD_URL &&
			['http:', 'https:'].includes(target.protocol) &&
			!isReferenceWebsite(target) &&
			target.href !== url.href &&
			!(target.origin === url.origin && target.pathname === '/download')
		)
			downloadHref = PUBLIC_DOWNLOAD_URL;
	} catch {
		/* An unconfigured download keeps the local empty state. */
	}
	return { title: 'Download Client', downloadHref };
};
