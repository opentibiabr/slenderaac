import fs from 'node:fs/promises';
import path from 'node:path';

import type { ClassicPresentation } from '$lib/themes/classic/reference-types';
import { screenshotPageHref } from '$lib/site-links';

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
		return {
			...value,
			links: { screenshot: screenshotPageHref(value.links.screenshot) },
			navigation: {},
		};
	} catch {
		return null;
	}
}
