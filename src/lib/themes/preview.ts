import { availableFeatureHref } from '$lib/site-pages';

export const previewKeys = [
	'themePreview',
	'classicReference',
	'classicGrid',
	'classicDemo',
];

export function themeSelectionHref(current: URL, theme: string): string {
	const target = new URL(current);
	target.searchParams.set('themePreview', theme);
	return target.pathname + target.search + target.hash;
}

export function themePreviewLoginHref(current: URL): string {
	if (!current.searchParams.has('themePreview')) return '/account/login';
	const target = new URL(themePreviewHref(current, '/account/login'), current);
	target.searchParams.set('returnTo', `${current.pathname}${current.search}`);
	return `${target.pathname}${target.search}`;
}

export function themePreviewHref(current: URL, href: string): string {
	href = informationDestination(href);
	let target: URL;
	try {
		target = new URL(href, current);
	} catch {
		return href;
	}
	if (target.origin !== current.origin) return href;
	const available = availableFeatureHref(target, target.hash);
	if (available) target = new URL(available, current);
	if (current.searchParams.has('themePreview')) {
		for (const key of previewKeys) {
			const value = current.searchParams.get(key);
			if (value !== null && !target.searchParams.has(key))
				target.searchParams.set(key, value);
		}
	}
	return `${target.pathname}${target.search}${target.hash}`;
}
import { informationDestination } from '$lib/information';
