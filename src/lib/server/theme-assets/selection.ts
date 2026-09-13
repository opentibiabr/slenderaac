import { previewKeys } from '$lib/themes/preview';
import { isThemeId, normalizeTheme, type ThemeId } from '$lib/themes/theme-ids';

export const themeCookie = 'slender-theme';

export function isThemeSwitchingEnabled(value: string | undefined): boolean {
	return !value?.trim() || value.trim().toLowerCase() === 'true';
}

export async function resolveThemeSelection(
	{
		configuredTheme,
		allowSwitching,
		preference,
		url,
	}: {
		configuredTheme: string | undefined;
		allowSwitching: boolean;
		preference?: string;
		url: URL;
	},
	resolveId: (value: unknown) => Promise<ThemeId | null>,
): Promise<{ selectedTheme: ThemeId; redirectTo: string | null }> {
	const defaultTheme =
		(await resolveId(configuredTheme)) ?? normalizeTheme(configuredTheme);
	const canonical = new URL(url);
	if (!allowSwitching) {
		const hasPreview = previewKeys.some((key) =>
			canonical.searchParams.has(key),
		);
		for (const key of previewKeys) canonical.searchParams.delete(key);
		return {
			selectedTheme: defaultTheme,
			redirectTo: hasPreview ? canonical.pathname + canonical.search : null,
		};
	}

	const preview = url.searchParams.get('themePreview');
	const resolvedPreview = await resolveId(preview);
	const selectedTheme =
		resolvedPreview ?? (isThemeId(preference) ? preference : defaultTheme);
	if (resolvedPreview && preview !== resolvedPreview) {
		canonical.searchParams.set('themePreview', resolvedPreview);
		return { selectedTheme, redirectTo: canonical.pathname + canonical.search };
	}
	return { selectedTheme, redirectTo: null };
}
