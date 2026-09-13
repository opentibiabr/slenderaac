export const themeIds = ['legbone', 'classic'] as const;

export type ThemeId = (typeof themeIds)[number];

export function isThemeId(value: unknown): value is ThemeId {
	return (
		typeof value === 'string' && (themeIds as readonly string[]).includes(value)
	);
}

export function normalizeTheme(value: unknown): ThemeId {
	const normalized =
		typeof value === 'string' ? value.trim().toLowerCase() : '';

	return isThemeId(normalized) ? normalized : 'legbone';
}
