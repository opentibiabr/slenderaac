import { rangedFileResponse } from '$lib/server/file-response';
import { loadSoundtrackCatalog } from '$lib/server/soundtrack';

import { env } from '$env/dynamic/private';

import type { RequestHandler } from './$types';

async function download(request: Request, head: boolean): Promise<Response> {
	const catalog = await loadSoundtrackCatalog(env.SOUNDTRACK_ASSETS_ROOT);
	return catalog?.archive
		? rangedFileResponse(request, catalog.archive, {
				head,
				downloadName: 'soundtrack.zip',
			})
		: new Response('Soundtrack archive not found', {
				status: 404,
				headers: { 'Cache-Control': 'no-store' },
			});
}

export const GET: RequestHandler = ({ request }) => download(request, false);
export const HEAD: RequestHandler = ({ request }) => download(request, true);
