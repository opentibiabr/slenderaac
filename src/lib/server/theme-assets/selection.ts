import { layoutDebugKeys, layoutSelectionKeys } from '$lib/themes/navigation';
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
): Promise<{
	selectedTheme: ThemeId;
	redirectTo: string | null;
	preferenceUpdate: ThemeId | null | undefined;
}> {
	const defaultTheme =
		(await resolveId(configuredTheme)) ?? normalizeTheme(configuredTheme);
	const canonical = new URL(url);
	if (!allowSwitching) {
		const hasSelectionState = [...layoutSelectionKeys, ...layoutDebugKeys].some(
			(key) => canonical.searchParams.has(key),
		);
		for (const key of [...layoutSelectionKeys, ...layoutDebugKeys]) {
			canonical.searchParams.delete(key);
		}
		return {
			selectedTheme: defaultTheme,
			redirectTo: hasSelectionState
				? canonical.pathname + canonical.search
				: null,
			preferenceUpdate: null,
		};
	}

	const requestedLayout =
		url.searchParams.get('layout') ?? url.searchParams.get('themePreview');
	const resolvedLayout = await resolveId(requestedLayout);
	const selectedTheme =
		resolvedLayout ?? (isThemeId(preference) ? preference : defaultTheme);
	const hasSelection = layoutSelectionKeys.some((key) =>
		canonical.searchParams.has(key),
	);
	for (const key of layoutSelectionKeys) canonical.searchParams.delete(key);
	return {
		selectedTheme,
		redirectTo: hasSelection ? canonical.pathname + canonical.search : null,
		preferenceUpdate: resolvedLayout ?? undefined,
	};
}
