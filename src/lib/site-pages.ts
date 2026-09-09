type FeaturePage = {
	path: string;
	title: string;
	section: string;
	headline: string;
	headlineWidth?: number;
	headlineHeight?: number;
	queryKeys?: string[];
	legacyMenuPaths?: string[];
};

export const featurePages: Record<string, FeaturePage> = {
	worldquests: {
		path: '/library/world-quests',
		title: 'World Quests',
		section: 'library',
		headline: 'headlineWorldQuests',
		headlineWidth: 192,
		headlineHeight: 32,
		queryKeys: ['worldquest', 'page', 'resultpage'],
	},
	worlds: {
		path: '/worlds',
		title: 'Worlds',
		section: 'community',
		headline: 'headlineWorlds',
		headlineWidth: 192,
		headlineHeight: 32,
		queryKeys: ['world', 'sort', 'order'],
		legacyMenuPaths: ['/online'],
	},
	achievements: {
		path: '/library/achievements',
		title: 'Achievements',
		section: 'library',
		headline: 'headlineAchievements',
		headlineWidth: 192,
		headlineHeight: 32,
	},
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

/** Update obsolete menu aliases without changing the standalone route. */
export function featureMenuHref(section: string, label: string, href: string) {
	const feature = Object.values(featurePages).find(
		(entry) => entry.section === section && entry.title === label,
	);
	if (
		!feature?.legacyMenuPaths ||
		!href.startsWith('/') ||
		href.startsWith('//')
	)
		return href;
	const url = new URL(href, 'https://slender.invalid');
	return feature.legacyMenuPaths.includes(url.pathname)
		? `${feature.path}${url.search}${url.hash}`
		: href;
}

/** Upgrade saved menu links when an unavailable module gains a native page. */
export function availableFeatureHref(url: URL, fragment = ''): string | null {
	if (url.pathname.replace(/\/$/, '') !== '/unavailable') return null;
	const feature = url.searchParams.get('feature') ?? '';
	if (!Object.hasOwn(featurePages, feature)) return null;
	const query = new URLSearchParams(url.search);
	query.delete('feature');
	return `${featurePages[feature].path}${query.size ? `?${query.toString()}` : ''}${fragment}`;
}
