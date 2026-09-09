import { unavailableFeatures } from '$lib/source-navigation';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const feature = url.searchParams.get('feature') ?? 'resource';
	return {
		title: Object.hasOwn(unavailableFeatures, feature)
			? unavailableFeatures[feature]
			: 'Resource',
	};
};
