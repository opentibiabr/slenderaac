import fs from 'node:fs/promises';
import path from 'node:path';

import type { ThemeId } from '$lib/themes/theme-ids';
import {
	encodeThemeAssetUrl,
	normalizeAssetPath,
} from '$lib/server/theme-assets/paths';

import { env } from '$env/dynamic/private';

type RawManifest = {
	schemaVersion?: unknown;
	name?: unknown;
	version?: unknown;
	assets?: unknown;
	hashes?: unknown;
};

export type ThemeAssetManifest = {
	schemaVersion: number;
	name: ThemeId;
	version: string;
	assets: Record<string, string>;
	hashes?: Record<string, string>;
};

export type ThemeAssetMetadata = {
	assets: Record<string, string>;
	version: string | null;
	warning: string | null;
};

const manifestCache = new Map<string, ThemeAssetMetadata>();

function emptyMetadata(warning: string | null): ThemeAssetMetadata {
	return {
		assets: {},
		version: null,
		warning,
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validatePathRecord(value: unknown): Record<string, string> | null {
	if (!isRecord(value)) {
		return null;
	}

	const result: Record<string, string> = {};
	for (const [key, rawPath] of Object.entries(value)) {
		const normalizedPath = normalizeAssetPath(rawPath);
		if (!normalizedPath) {
			return null;
		}

		result[key] = normalizedPath;
	}

	return result;
}

function validateManifest(
	theme: ThemeId,
	rawManifest: RawManifest,
): ThemeAssetManifest | null {
	if (
		typeof rawManifest.schemaVersion !== 'number' ||
		rawManifest.name !== theme ||
		typeof rawManifest.version !== 'string' ||
		rawManifest.version.length === 0
	) {
		return null;
	}

	const assets = validatePathRecord(rawManifest.assets);
	if (!assets) {
		return null;
	}

	let hashes: Record<string, string> | undefined;
	if (rawManifest.hashes !== undefined) {
		if (!isRecord(rawManifest.hashes)) {
			return null;
		}

		hashes = {};
		for (const [rawPath, hash] of Object.entries(rawManifest.hashes)) {
			const normalizedPath = normalizeAssetPath(rawPath);
			if (!normalizedPath || typeof hash !== 'string' || hash.length === 0) {
				return null;
			}

			hashes[normalizedPath] = hash;
		}
	}

	return {
		schemaVersion: rawManifest.schemaVersion,
		name: theme,
		version: rawManifest.version,
		assets,
		hashes,
	};
}

async function getManifestPath(theme: ThemeId): Promise<string | null> {
	if (!env.THEME_ASSETS_ROOT || !path.isAbsolute(env.THEME_ASSETS_ROOT)) {
		return null;
	}

	const themeRoot = path.resolve(env.THEME_ASSETS_ROOT, theme);
	const manifestPath = path.resolve(themeRoot, 'manifest.json');

	try {
		const rootReal = await fs.realpath(themeRoot);
		const manifestReal = await fs.realpath(manifestPath);
		const relative = path.relative(rootReal, manifestReal);

		if (
			relative.length === 0 ||
			relative.startsWith('..') ||
			path.isAbsolute(relative) ||
			path.basename(manifestReal) !== 'manifest.json'
		) {
			return null;
		}

		return manifestReal;
	} catch {
		return null;
	}
}

export async function loadThemeAssetMetadata(
	theme: ThemeId,
): Promise<ThemeAssetMetadata> {
	const manifestPath = await getManifestPath(theme);
	if (!manifestPath) {
		return emptyMetadata('theme asset pack is missing or unavailable');
	}

	try {
		const stats = await fs.stat(manifestPath);
		if (!stats.isFile()) {
			return emptyMetadata('theme asset manifest is unavailable');
		}

		const cacheKey = `${manifestPath}:${stats.mtimeMs}:${stats.size}`;
		const cached = manifestCache.get(cacheKey);
		if (cached) {
			return cached;
		}

		const parsed = JSON.parse(
			await fs.readFile(manifestPath, 'utf8'),
		) as RawManifest;
		const manifest = validateManifest(theme, parsed);
		if (!manifest) {
			return emptyMetadata('theme asset manifest is invalid');
		}

		const assets = Object.fromEntries(
			Object.entries(manifest.assets).map(([key, assetPath]) => {
				const version = manifest.hashes?.[assetPath] ?? manifest.version;

				return [key, encodeThemeAssetUrl(theme, assetPath, version)];
			}),
		);

		const metadata = {
			assets,
			version: manifest.version,
			warning: null,
		};

		manifestCache.clear();
		manifestCache.set(cacheKey, metadata);

		return metadata;
	} catch {
		return emptyMetadata('theme asset manifest is invalid');
	}
}
