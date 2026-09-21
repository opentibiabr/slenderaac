import fs from 'node:fs/promises';
import path from 'node:path';

import { type ServedFile, weakFileEtag } from '$lib/server/file-response';

export async function resolveLocalMediaRoot(
	configuredRoot: string | undefined,
): Promise<string | null> {
	if (!configuredRoot || !path.isAbsolute(configuredRoot)) return null;
	try {
		const rootReal = await fs.realpath(configuredRoot);
		return (await fs.stat(rootReal)).isDirectory() ? rootReal : null;
	} catch {
		return null;
	}
}

function normalizedRelativePath(value: string): string | null {
	if (
		value.length === 0 ||
		value.includes('\0') ||
		value.includes('\\') ||
		value.startsWith('/')
	)
		return null;
	const parts = value.split('/');
	if (
		parts.some(
			(part) =>
				part.length === 0 ||
				part === '.' ||
				part === '..' ||
				part.startsWith('.'),
		)
	)
		return null;
	const normalized = path.posix.normalize(value);
	return normalized === '.' || normalized.startsWith('../') ? null : normalized;
}

export async function localMediaFile(
	rootReal: string,
	manifestPath: string | undefined,
	contentTypes: Record<string, string>,
): Promise<ServedFile | null> {
	if (!manifestPath) return null;
	const normalized = normalizedRelativePath(manifestPath);
	if (!normalized) return null;
	const extension = path.posix.extname(normalized).toLowerCase();
	const contentType = contentTypes[extension];
	if (!contentType) return null;
	const candidate = path.resolve(rootReal, ...normalized.split('/'));

	try {
		const linkStats = await fs.lstat(candidate);
		if (linkStats.isSymbolicLink() || !linkStats.isFile()) return null;
		const fileReal = await fs.realpath(candidate);
		const relative = path.relative(rootReal, fileReal);
		if (
			relative.length === 0 ||
			relative === '..' ||
			relative.startsWith(`..${path.sep}`) ||
			path.isAbsolute(relative)
		)
			return null;
		const stats = await fs.stat(fileReal);
		if (!stats.isFile() || stats.size === 0) return null;
		return {
			path: fileReal,
			name: path.basename(fileReal),
			size: stats.size,
			modified: stats.mtime,
			etag: weakFileEtag(stats.size, stats.mtimeMs),
			contentType,
		};
	} catch {
		return null;
	}
}
