import fs from 'node:fs/promises';
import path from 'node:path';

export type FankitPackage = {
	path: string;
	name: string;
	size: number;
	modified: Date;
	etag: string;
};

function weakEtag(size: number, mtimeMs: number): string {
	return `W/"${size.toString(16)}-${Math.trunc(mtimeMs).toString(16)}"`;
}

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
			etag: weakEtag(stats.size, stats.mtimeMs),
		};
	} catch {
		return null;
	}
}

export function fankitDownloadHeaders(file: FankitPackage): Headers {
	const encodedName = encodeURIComponent(file.name).replace(
		/[!'()*]/g,
		(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
	);
	return new Headers({
		'Cache-Control': 'public, max-age=300',
		'Content-Disposition': `attachment; filename="fankit.zip"; filename*=UTF-8''${encodedName}`,
		'Content-Length': String(file.size),
		'Content-Type': 'application/zip',
		ETag: file.etag,
		'Last-Modified': file.modified.toUTCString(),
	});
}

export function isFankitNotModified(
	request: Request,
	file: FankitPackage,
): boolean {
	const ifNoneMatch = request.headers.get('if-none-match');
	if (
		ifNoneMatch
			?.split(',')
			.map((value) => value.trim())
			.some((value) => value === '*' || value === file.etag)
	)
		return true;

	if (ifNoneMatch) return false;
	const ifModifiedSince = request.headers.get('if-modified-since');
	if (!ifModifiedSince) return false;
	const timestamp = Date.parse(ifModifiedSince);
	return (
		Number.isFinite(timestamp) &&
		Math.floor(file.modified.getTime() / 1000) <= Math.floor(timestamp / 1000)
	);
}
