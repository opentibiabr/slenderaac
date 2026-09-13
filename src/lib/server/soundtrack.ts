import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';

import {
	attachmentDisposition,
	fileNotModified,
	weakFileEtag,
} from '$lib/server/file-response';

type SoundtrackFile = {
	path: string;
	name: string;
	size: number;
	modified: Date;
	etag: string;
	contentType: string;
};

export type SoundtrackTrack = {
	id: string;
	title: string;
	audio: SoundtrackFile | null;
	image: SoundtrackFile | null;
};

export type SoundtrackCatalog = {
	tracks: SoundtrackTrack[];
	archive: SoundtrackFile | null;
};

type ManifestTrack = {
	id: string;
	title: string;
	audio: string;
	image?: string;
};

type Manifest = {
	version: 1;
	archive?: string;
	tracks: ManifestTrack[];
};

const audioTypes: Record<string, string> = {
	'.flac': 'audio/flac',
	'.m4a': 'audio/mp4',
	'.mp3': 'audio/mpeg',
	'.ogg': 'audio/ogg',
	'.wav': 'audio/wav',
};
const imageTypes: Record<string, string> = {
	'.gif': 'image/gif',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
};
const archiveTypes: Record<string, string> = { '.zip': 'application/zip' };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseManifest(value: unknown): Manifest | null {
	if (
		!isRecord(value) ||
		value.version !== 1 ||
		!Array.isArray(value.tracks) ||
		value.tracks.length > 100 ||
		(value.archive !== undefined && typeof value.archive !== 'string')
	)
		return null;

	const seen = new Set<string>();
	const tracks: ManifestTrack[] = [];
	for (const candidate of value.tracks) {
		if (
			!isRecord(candidate) ||
			typeof candidate.id !== 'string' ||
			!/^[a-z0-9][a-z0-9-]{0,63}$/.test(candidate.id) ||
			seen.has(candidate.id) ||
			typeof candidate.title !== 'string' ||
			candidate.title.trim().length === 0 ||
			candidate.title.length > 120 ||
			typeof candidate.audio !== 'string' ||
			(candidate.image !== undefined && typeof candidate.image !== 'string')
		)
			return null;
		seen.add(candidate.id);
		tracks.push({
			id: candidate.id,
			title: candidate.title.trim(),
			audio: candidate.audio,
			image: candidate.image,
		});
	}

	return {
		version: 1,
		archive: value.archive,
		tracks,
	};
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

async function catalogFile(
	rootReal: string,
	manifestPath: string | undefined,
	contentTypes: Record<string, string>,
): Promise<SoundtrackFile | null> {
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
			relative.startsWith('..') ||
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

export async function loadSoundtrackCatalog(
	configuredRoot: string | undefined,
): Promise<SoundtrackCatalog | null> {
	if (!configuredRoot || !path.isAbsolute(configuredRoot)) return null;

	try {
		const rootReal = await fs.realpath(configuredRoot);
		const rootStats = await fs.stat(rootReal);
		if (!rootStats.isDirectory()) return null;
		const manifestPath = path.join(rootReal, 'manifest.json');
		const manifestStats = await fs.lstat(manifestPath);
		if (
			manifestStats.isSymbolicLink() ||
			!manifestStats.isFile() ||
			manifestStats.size > 1024 * 1024
		)
			return null;
		const manifest = parseManifest(
			JSON.parse(await fs.readFile(manifestPath, 'utf8')),
		);
		if (!manifest) return null;

		return {
			tracks: await Promise.all(
				manifest.tracks.map(async (track) => ({
					id: track.id,
					title: track.title,
					audio: await catalogFile(rootReal, track.audio, audioTypes),
					image: await catalogFile(rootReal, track.image, imageTypes),
				})),
			),
			archive: await catalogFile(rootReal, manifest.archive, archiveTypes),
		};
	} catch {
		return null;
	}
}

type ByteRange = { start: number; end: number };

export function parseByteRange(value: string, size: number): ByteRange | null {
	const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
	if (!match || size <= 0 || (!match[1] && !match[2])) return null;
	if (!match[1]) {
		const suffix = Number(match[2]);
		if (!Number.isSafeInteger(suffix) || suffix <= 0) return null;
		return { start: Math.max(0, size - suffix), end: size - 1 };
	}
	const start = Number(match[1]);
	const requestedEnd = match[2] ? Number(match[2]) : size - 1;
	if (
		!Number.isSafeInteger(start) ||
		!Number.isSafeInteger(requestedEnd) ||
		start < 0 ||
		start >= size ||
		requestedEnd < start
	)
		return null;
	return { start, end: Math.min(requestedEnd, size - 1) };
}

function ifRangeMatches(request: Request, file: SoundtrackFile): boolean {
	const ifRange = request.headers.get('if-range');
	if (!ifRange) return true;
	const timestamp = Date.parse(ifRange);
	return (
		Number.isFinite(timestamp) &&
		Math.floor(file.modified.getTime() / 1000) <= Math.floor(timestamp / 1000)
	);
}

export function soundtrackFileResponse(
	request: Request,
	file: SoundtrackFile,
	head = false,
	download = false,
): Response {
	const headers = new Headers({
		'Accept-Ranges': 'bytes',
		'Cache-Control': 'public, max-age=300',
		'Content-Length': String(file.size),
		'Content-Type': file.contentType,
		ETag: file.etag,
		'Last-Modified': file.modified.toUTCString(),
	});
	if (download) {
		headers.set(
			'Content-Disposition',
			attachmentDisposition(file.name, 'soundtrack.zip'),
		);
	}

	if (fileNotModified(request, file)) {
		headers.delete('Content-Length');
		headers.delete('Content-Disposition');
		return new Response(null, { status: 304, headers });
	}

	let status = 200;
	let start = 0;
	let end = file.size - 1;
	const requestedRange = request.headers.get('range');
	if (requestedRange && ifRangeMatches(request, file)) {
		const range = parseByteRange(requestedRange, file.size);
		if (!range) {
			headers.set('Content-Range', `bytes */${file.size}`);
			headers.set('Content-Length', '0');
			return new Response(null, { status: 416, headers });
		}
		({ start, end } = range);
		status = 206;
		headers.set('Content-Range', `bytes ${start}-${end}/${file.size}`);
		headers.set('Content-Length', String(end - start + 1));
	}

	if (head) return new Response(null, { status, headers });
	const body = Readable.toWeb(
		createReadStream(file.path, { start, end }),
	) as ReadableStream;
	return new Response(body, { status, headers });
}
