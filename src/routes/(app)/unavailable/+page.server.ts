import { redirect } from '@sveltejs/kit';

import { availableFeatureHref } from '$lib/site-pages';
import { unavailableFeatures } from '$lib/source-navigation';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const available = availableFeatureHref(url);
	if (available) throw redirect(308, available);
	const feature = url.searchParams.get('feature') ?? 'resource';
	return {
		title: Object.hasOwn(unavailableFeatures, feature)
			? unavailableFeatures[feature]
			: 'Resource',
	};
};
