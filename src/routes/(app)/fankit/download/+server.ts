import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';

import { fankitDownloadHeaders, loadFankitPackage } from '$lib/server/fankit';
import { fileNotModified } from '$lib/server/file-response';

import { env } from '$env/dynamic/private';

import type { RequestHandler } from './$types';

function notFound(): Response {
	return new Response('Fankit package not found', {
		status: 404,
		headers: { 'Cache-Control': 'no-store' },
	});
}

async function download(request: Request, head: boolean): Promise<Response> {
	const file = await loadFankitPackage(env.FANKIT_FILE);
	if (!file) return notFound();

	const headers = fankitDownloadHeaders(file);
	if (fileNotModified(request, file)) {
		return new Response(null, {
			status: 304,
			headers: {
				'Cache-Control': headers.get('Cache-Control') ?? '',
				ETag: file.etag,
				'Last-Modified': file.modified.toUTCString(),
			},
		});
	}

	if (head) return new Response(null, { headers });
	const body = Readable.toWeb(createReadStream(file.path)) as ReadableStream;
	return new Response(body, { headers });
}

export const GET: RequestHandler = ({ request }) => download(request, false);
export const HEAD: RequestHandler = ({ request }) => download(request, true);
