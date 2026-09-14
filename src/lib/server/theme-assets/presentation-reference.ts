import fs from 'node:fs/promises';
import path from 'node:path';

import type { ThemePresentation } from '$lib/themes/reference-types';
import { themeAssetPack, type ThemeId } from '$lib/themes/profiles';

import { env } from '$env/dynamic/private';

export async function loadPresentationReference(
	theme: ThemeId,
): Promise<ThemePresentation | null> {
	const referencePack = themeAssetPack(theme, 'referencePack');
	if (!referencePack || !env.THEME_ASSETS_ROOT) return null;
	try {
		const file = path.join(
			env.THEME_ASSETS_ROOT,
			referencePack,
			'reference',
			'presentation.json',
		);
		const value = JSON.parse(
			await fs.readFile(file, 'utf8'),
		) as ThemePresentation;
		if (!value || typeof value !== 'object') return null;
		const colors = value.calendarColors;
		if (
			colors !== undefined &&
			(!colors ||
				typeof colors !== 'object' ||
				Array.isArray(colors) ||
				!Object.entries(colors).every(
					([key, color]) =>
						/^#[0-9a-f]{6}$/i.test(key) &&
						typeof color === 'string' &&
						/^#[0-9a-f]{6}$/i.test(color),
				))
		)
			return null;
		// Only visual tokens cross into layout data; captured content and destinations do not.
		return colors ? { calendarColors: colors } : {};
	} catch {
		return null;
	}
}
