export const newsTypes = [
	{ value: 'news', label: 'News' },
	{ value: 'ticker', label: 'News Ticker' },
	{ value: 'article', label: 'Featured Article' },
] as const;

export const newsCategories = [
	{ value: 'server', label: 'Server' },
	{ value: 'community', label: 'Community' },
	{ value: 'development', label: 'Development' },
	{ value: 'support', label: 'Support' },
	{ value: 'technical', label: 'Technical Issues' },
] as const;

export function newsType(
	value: unknown,
): (typeof newsTypes)[number]['value'] | null {
	return newsTypes.find((option) => option.value === value)?.value ?? null;
}

export function newsCategory(
	value: unknown,
): (typeof newsCategories)[number]['value'] | null {
	return newsCategories.find((option) => option.value === value)?.value ?? null;
}

export function newsDate(value: unknown): Date | null {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
		return null;
	const date = new Date(`${value}T12:00:00Z`);
	return Number.isFinite(date.getTime()) &&
		date.toISOString().slice(0, 10) === value
		? date
		: null;
}
