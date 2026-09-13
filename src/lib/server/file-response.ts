import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';

export type CacheableFile = {
	size: number;
	modified: Date;
	etag: string;
};

export type ServedFile = CacheableFile & {
	path: string;
	name: string;
	contentType: string;
};

export function weakFileEtag(size: number, mtimeMs: number): string {
	return `W/"${size.toString(16)}-${Math.trunc(mtimeMs).toString(16)}"`;
}

export function fileNotModified(
	request: Request,
	file: CacheableFile,
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

export function attachmentDisposition(
	fileName: string,
	fallbackName: string,
): string {
	const encodedName = encodeURIComponent(fileName).replace(
		/[!'()*]/g,
		(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
	);
	return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`;
}

export type ByteRange = { start: number; end: number };

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

function ifRangeMatches(request: Request, file: ServedFile): boolean {
	const ifRange = request.headers.get('if-range');
	if (!ifRange) return true;
	const timestamp = Date.parse(ifRange);
	return (
		Number.isFinite(timestamp) &&
		Math.floor(file.modified.getTime() / 1000) <= Math.floor(timestamp / 1000)
	);
}

export function rangedFileResponse(
	request: Request,
	file: ServedFile,
	options: { head?: boolean; downloadName?: string } = {},
): Response {
	const headers = new Headers({
		'Accept-Ranges': 'bytes',
		'Cache-Control': 'public, max-age=300',
		'Content-Length': String(file.size),
		'Content-Type': file.contentType,
		ETag: file.etag,
		'Last-Modified': file.modified.toUTCString(),
	});
	if (options.downloadName)
		headers.set(
			'Content-Disposition',
			attachmentDisposition(file.name, options.downloadName),
		);

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

	if (options.head) return new Response(null, { status, headers });
	const body = Readable.toWeb(
		createReadStream(file.path, { start, end }),
	) as ReadableStream;
	return new Response(body, { status, headers });
}
