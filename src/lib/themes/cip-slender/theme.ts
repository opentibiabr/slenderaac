export type CipSlenderAssetKey =
	| 'logo'
	| 'background'
	| 'menuOrnament'
	| 'contentOrnament'
	| 'themeBoxOrnament';

export type CipSlenderAssets = Partial<Record<CipSlenderAssetKey, string>> &
	Record<string, string | undefined>;

export function cipAsset(
	assets: Record<string, string | undefined> | null | undefined,
	key: CipSlenderAssetKey,
): string | null {
	return assets?.[key] ?? null;
}
