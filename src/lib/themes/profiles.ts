/**
 * Theme metadata that is safe to import from both server and browser code.
 *
 * Keep component imports out of this module. The client-side registry adds the
 * static Svelte renderers on top of these profiles.
 */
export type ThemeProfile = {
	label: string;
	assets: {
		chromePack: string | null;
		referencePack: string | null;
		catalogArtworkPack: string | null;
	};
	data: {
		latestNewsLimit: number;
	};
	navigation: {
		preserveSubrouteScroll: boolean;
	};
	presentation: {
		pageSurface: 'ornate' | 'cards';
		contentSource: 'reference' | 'native';
	};
};

/**
 * The single source of truth for built-in theme IDs and their server-safe
 * capabilities. Keep the map explicit so a new layout cannot be registered
 * without declaring how it obtains assets and data presentation.
 */
export const themeProfiles = {
	legbone: {
		label: 'Legbone',
		assets: {
			chromePack: null,
			referencePack: null,
			catalogArtworkPack: 'classic',
		},
		data: {
			latestNewsLimit: 5,
		},
		navigation: {
			preserveSubrouteScroll: true,
		},
		presentation: {
			pageSurface: 'cards',
			contentSource: 'native',
		},
	},
	classic: {
		label: 'Classic',
		assets: {
			chromePack: 'classic',
			referencePack: 'classic',
			catalogArtworkPack: null,
		},
		data: {
			latestNewsLimit: 8,
		},
		navigation: {
			preserveSubrouteScroll: false,
		},
		presentation: {
			pageSurface: 'ornate',
			contentSource: 'reference',
		},
	},
} satisfies Record<string, ThemeProfile>;

export type ThemeId = keyof typeof themeProfiles;

export type ThemeAssetKind = keyof ThemeProfile['assets'];

export const themeIds = Object.keys(themeProfiles) as ThemeId[];

export const DEFAULT_THEME_ID: ThemeId = 'legbone';

export function isThemeId(value: unknown): value is ThemeId {
	return typeof value === 'string' && value in themeProfiles;
}

export function normalizeTheme(value: unknown): ThemeId {
	const normalized =
		typeof value === 'string' ? value.trim().toLowerCase() : '';

	return isThemeId(normalized) ? normalized : DEFAULT_THEME_ID;
}

export function themeProfile(theme: ThemeId): ThemeProfile {
	return themeProfiles[theme];
}

export function themeAssetPack(
	theme: ThemeId,
	kind: ThemeAssetKind,
): ThemeId | null {
	const source = themeProfiles[theme].assets[kind];
	return source !== null && isThemeId(source) ? source : null;
}

/**
 * Theme profiles may refer to another registered theme's asset pack. Keep the
 * check here so a typo cannot silently produce an empty asset source.
 */
export function validateThemeProfiles(): void {
	for (const [theme, profile] of Object.entries(themeProfiles)) {
		for (const [kind, source] of Object.entries(profile.assets)) {
			if (source !== null && !isThemeId(source)) {
				throw new Error(
					`Invalid ${kind} source "${source}" declared by theme "${theme}"`,
				);
			}
		}
	}
}

validateThemeProfiles();
