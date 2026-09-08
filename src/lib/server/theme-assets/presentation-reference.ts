import fs from 'node:fs/promises';
import path from 'node:path';

import type { CipPresentation } from '$lib/themes/cip-slender/reference-types';

import { env } from '$env/dynamic/private';

export async function loadPresentationReference(
	theme: string,
): Promise<CipPresentation | null> {
	if (theme !== 'cip-slender' || !env.THEME_ASSETS_ROOT) return null;
	try {
		const file = path.join(
			env.THEME_ASSETS_ROOT,
			'cip-slender',
			'reference',
			'presentation.json',
		);
		const value = JSON.parse(
			await fs.readFile(file, 'utf8'),
		) as CipPresentation;
		const safeHref = (href: unknown) =>
			typeof href === 'string' && /^(https?:\/\/|\/(?!\/)|#)/.test(href);
		if (
			typeof value.footer !== 'string' ||
			['premiumText', 'premiumButtonText', 'pollText'].some((key) => {
				const field =
					value[key as 'premiumText' | 'premiumButtonText' | 'pollText'];
				return field !== undefined && typeof field !== 'string';
			}) ||
			(value.calendarColors !== undefined &&
				!Object.entries(value.calendarColors).every(
					([key, color]) =>
						/^#[0-9a-f]{6}$/i.test(key) &&
						typeof color === 'string' &&
						/^#[0-9a-f]{6}$/i.test(color),
				)) ||
			!value.links ||
			!value.navigation ||
			!Object.values(value.links).every(safeHref) ||
			!Object.values(value.navigation).every(
				(items) =>
					Array.isArray(items) &&
					items.every(
						(item) => typeof item.label === 'string' && safeHref(item.href),
					),
			)
		)
			return null;
		return value;
	} catch {
		return null;
	}
}
