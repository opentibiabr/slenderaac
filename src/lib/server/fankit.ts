import fs from 'node:fs/promises';
import path from 'node:path';

import { attachmentDisposition, weakFileEtag } from '$lib/server/file-response';

export type FankitPackage = {
	path: string;
	name: string;
	size: number;
	modified: Date;
	etag: string;
};

export async function loadFankitPackage(
	configuredPath: string | undefined,
): Promise<FankitPackage | null> {
	if (!configuredPath || !path.isAbsolute(configuredPath)) return null;

	try {
		const configuredStats = await fs.lstat(configuredPath);
		if (
			configuredStats.isSymbolicLink() ||
			!configuredStats.isFile() ||
			configuredStats.size === 0 ||
			path.extname(configuredPath).toLowerCase() !== '.zip'
		)
			return null;

		const resolvedPath = await fs.realpath(configuredPath);
		const stats = await fs.stat(resolvedPath);
		if (!stats.isFile() || stats.size === 0) return null;

		return {
			path: resolvedPath,
			name: path.basename(resolvedPath),
			size: stats.size,
			modified: stats.mtime,
			etag: weakFileEtag(stats.size, stats.mtimeMs),
		};
	} catch {
		return null;
	}
}

export function fankitDownloadHeaders(file: FankitPackage): Headers {
	return new Headers({
		'Cache-Control': 'public, max-age=300',
		'Content-Disposition': attachmentDisposition(file.name, 'fankit.zip'),
		'Content-Length': String(file.size),
		'Content-Type': 'application/zip',
		ETag: file.etag,
		'Last-Modified': file.modified.toUTCString(),
	});
}
