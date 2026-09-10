import fs from 'node:fs/promises';
import path from 'node:path';

import type { ClassicPresentation } from '$lib/themes/classic/reference-types';

import { env } from '$env/dynamic/private';

export async function loadPresentationReference(
	theme: string,
): Promise<ClassicPresentation | null> {
	if (theme !== 'classic' || !env.THEME_ASSETS_ROOT) return null;
	try {
		const file = path.join(
			env.THEME_ASSETS_ROOT,
			'classic',
			'reference',
			'presentation.json',
		);
		const value = JSON.parse(
			await fs.readFile(file, 'utf8'),
		) as ClassicPresentation;
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
