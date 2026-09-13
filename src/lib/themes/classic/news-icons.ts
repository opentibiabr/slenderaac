import { newsCategories, newsCategory } from '$lib/news';

const suffixes = {
	server: 'Server',
	community: 'Community',
	development: 'Development',
	support: 'Support',
	technical: 'Technical',
} as const;

export const classicNewsCategories = newsCategories.map(({ value, label }) => ({
	key: value,
	label,
	iconKey: `newsArchiveIcon${suffixes[value]}`,
}));

export function classicNewsIcon(
	assets: Record<string, string | undefined> | null | undefined,
	category: unknown,
	headline = false,
) {
	const selected = newsCategory(category) ?? 'community';
	const suffix = suffixes[selected];
	return (
		(headline
			? (assets?.[`newsHeadlineIcon${suffix}`] ??
				(selected === 'development' ? assets?.newsHeadlineIcon : null))
			: null) ??
		assets?.[`newsArchiveIcon${suffix}`] ??
		null
	);
}
