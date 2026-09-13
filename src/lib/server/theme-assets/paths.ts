import path from 'node:path';

import type { ThemeId } from '$lib/themes/theme-ids';

const allowedExtensions = new Set([
	'png',
	'jpg',
	'jpeg',
	'gif',
	'webp',
	'ico',
	'ttf',
]);

export const mimeTypes = {
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	gif: 'image/gif',
	webp: 'image/webp',
	ico: 'image/x-icon',
	ttf: 'font/ttf',
} as const;

export type ThemeAssetExtension = keyof typeof mimeTypes;

function decodeRepeatedly(value: string): string | null {
	let decoded = value;

	for (let i = 0; i < 3; i += 1) {
		try {
			const next = decodeURIComponent(decoded);
			if (next === decoded) {
				return decoded;
			}
			decoded = next;
		} catch {
			return null;
		}
	}

	return decoded;
}

export function normalizeAssetPath(value: unknown): string | null {
	if (typeof value !== 'string' || value.length === 0) {
		return null;
	}

	const decoded = decodeRepeatedly(value);
	if (!decoded || decoded.includes('\0') || decoded.includes('\\')) {
		return null;
	}

	if (decoded.startsWith('/')) {
		return null;
	}

	const parts = decoded.split('/');
	if (
		parts.some(
			(part) =>
				part.length === 0 ||
				part === '.' ||
				part === '..' ||
				part.startsWith('.'),
		)
	) {
		return null;
	}

	const normalized = path.posix.normalize(decoded);
	if (
		normalized.length === 0 ||
		normalized === '.' ||
		normalized.startsWith('../') ||
		normalized.includes('/../')
	) {
		return null;
	}

	const extension = path.posix.extname(normalized).slice(1).toLowerCase();
	if (!allowedExtensions.has(extension)) {
		return null;
	}

	return normalized;
}

export function assetExtension(assetPath: string): ThemeAssetExtension | null {
	const extension = path.posix.extname(assetPath).slice(1).toLowerCase();

	return extension in mimeTypes ? (extension as ThemeAssetExtension) : null;
}

export function encodeThemeAssetUrl(
	theme: ThemeId,
	assetPath: string,
	version?: string | null,
): string {
	const encodedPath = assetPath
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');
	const baseUrl = `/theme-assets/${theme}/${encodedPath}`;

	return version ? `${baseUrl}?v=${encodeURIComponent(version)}` : baseUrl;
}

export function isVersionedAssetRequest(assetPath: string, url: URL): boolean {
	if (url.searchParams.has('v')) {
		return true;
	}

	const basename = path.posix.basename(assetPath);

	return /(?:^|[.-])[a-f0-9]{8,}(?:[.-]|$)/i.test(basename);
}
