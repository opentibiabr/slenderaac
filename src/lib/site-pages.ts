type FeaturePage = {
	path: string;
	title: string;
	section: string;
	headline: string;
	queryKeys?: string[];
};

export const featurePages: Record<string, FeaturePage> = {
	spells: {
		path: '/library/spells',
		title: 'Spells',
		section: 'library',
		headline: 'headlineSpells',
		queryKeys: ['spell', 'vocation', 'group', 'type', 'premium', 'sort'],
	},
	experiencetable: {
		path: '/library/experience-table',
		title: 'Experience Table',
		section: 'library',
		headline: 'headlineExperienceTable',
	},
};

/** Upgrade saved menu links when an unavailable module gains a native page. */
export function availableFeatureHref(url: URL, fragment = ''): string | null {
	if (url.pathname.replace(/\/$/, '') !== '/unavailable') return null;
	const feature = url.searchParams.get('feature') ?? '';
	if (!Object.hasOwn(featurePages, feature)) return null;
	const query = new URLSearchParams(url.search);
	query.delete('feature');
	return `${featurePages[feature].path}${query.size ? `?${query.toString()}` : ''}${fragment}`;
}
