export type ThemeAssets = Record<string, string | undefined>;

export type ThemeAssetKey = string;

export function themeAsset(
	assets: ThemeAssets | null | undefined,
	key: ThemeAssetKey,
): string | null {
	return assets?.[key] ?? null;
}
