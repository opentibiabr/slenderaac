import { informationDestination } from '$lib/information';
import { availableFeatureHref } from '$lib/site-pages';

export const layoutSelectionKeys = ['layout', 'themePreview'] as const;
export const layoutDebugKeys = [
	'classicReference',
	'classicGrid',
	'classicDemo',
] as const;

export function layoutSelectionHref(current: URL, layout: string): string {
	const target = new URL(current);
	for (const key of layoutSelectionKeys) target.searchParams.delete(key);
	target.searchParams.set('layout', layout);
	return target.pathname + target.search + target.hash;
}

export function layoutLoginHref(current: URL): string {
	if (!hasLayoutSelection(current)) return '/account/login';
	const target = new URL('/account/login', current);
	copyLayoutSelection(current, target);
	target.searchParams.set('returnTo', `${current.pathname}${current.search}`);
	return `${target.pathname}${target.search}`;
}

export function hasLayoutSelection(url: URL): boolean {
	return layoutSelectionKeys.some((key) => url.searchParams.has(key));
}

export function copyLayoutSelection(current: URL, target: URL): void {
	for (const key of layoutSelectionKeys) {
		const value = current.searchParams.get(key);
		if (value !== null && !target.searchParams.has(key)) {
			target.searchParams.set(key, value);
		}
	}
}

export function siteHref(current: URL, href: string): string {
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
	for (const key of layoutDebugKeys) {
		const value = current.searchParams.get(key);
		if (value !== null && !target.searchParams.has(key)) {
			target.searchParams.set(key, value);
		}
	}
	return `${target.pathname}${target.search}${target.hash}`;
}
