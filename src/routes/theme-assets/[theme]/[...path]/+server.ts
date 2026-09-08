import fs from 'node:fs/promises';
import path from 'node:path';

import {
	assetExtension,
	isVersionedAssetRequest,
	mimeTypes,
	normalizeAssetPath,
} from '$lib/server/theme-assets/paths';
import { isThemeId } from '$lib/themes/theme-ids';

import { env } from '$env/dynamic/private';

import type { RequestHandler } from './$types';

function notFound(): Response {
	return new Response('Not found', { status: 404 });
}

function weakEtag(stats: { size: number; mtimeMs: number }): string {
	return `W/"${stats.size.toString(16)}-${Math.trunc(stats.mtimeMs).toString(16)}"`;
}

export const GET: RequestHandler = async ({ params, request, url }) => {
	if (!isThemeId(params.theme)) {
		return notFound();
	}

	if (!env.THEME_ASSETS_ROOT || !path.isAbsolute(env.THEME_ASSETS_ROOT)) {
		return notFound();
	}

	const normalizedPath = normalizeAssetPath(params.path);
	if (!normalizedPath) {
		return notFound();
	}

	const extension = assetExtension(normalizedPath);
	if (!extension) {
		return notFound();
	}

	const themeRoot = path.resolve(env.THEME_ASSETS_ROOT, params.theme);
	const candidatePath = path.resolve(themeRoot, ...normalizedPath.split('/'));

	try {
		const rootReal = await fs.realpath(themeRoot);
		const fileReal = await fs.realpath(candidatePath);
		const relative = path.relative(rootReal, fileReal);

		if (
			relative.length === 0 ||
			relative.startsWith('..') ||
			path.isAbsolute(relative)
		) {
			return notFound();
		}

		const stats = await fs.stat(fileReal);
		if (!stats.isFile()) {
			return notFound();
		}

		const etag = weakEtag(stats);
		if (request.headers.get('if-none-match') === etag) {
			return new Response(null, {
				status: 304,
				headers: {
					ETag: etag,
				},
			});
		}

		const lastModified = stats.mtime.toUTCString();
		const ifModifiedSince = request.headers.get('if-modified-since');
		if (
			ifModifiedSince &&
			Date.parse(ifModifiedSince) >= stats.mtime.getTime()
		) {
			return new Response(null, {
				status: 304,
				headers: {
					ETag: etag,
					'Last-Modified': lastModified,
				},
			});
		}

		const cacheControl = isVersionedAssetRequest(normalizedPath, url)
			? 'public, max-age=31536000, immutable'
			: 'public, max-age=300';

		return new Response(await fs.readFile(fileReal), {
			headers: {
				'Cache-Control': cacheControl,
				ETag: etag,
				'Last-Modified': lastModified,
				'Content-Type': mimeTypes[extension],
			},
		});
	} catch {
		return notFound();
	}
};
