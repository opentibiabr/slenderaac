import { rangedFileResponse } from '$lib/server/file-response';
import { loadSoundtrackCatalog } from '$lib/server/soundtrack';

import { env } from '$env/dynamic/private';

import type { RequestHandler } from './$types';

async function media(
	request: Request,
	trackId: string,
	kind: string,
	head: boolean,
): Promise<Response> {
	if (!['audio', 'image'].includes(kind))
		return new Response('Not found', { status: 404 });
	const catalog = await loadSoundtrackCatalog(env.SOUNDTRACK_ASSETS_ROOT);
	const track = catalog?.tracks.find((entry) => entry.id === trackId);
	const file = kind === 'audio' ? track?.audio : track?.image;
	return file
		? rangedFileResponse(request, file, { head })
		: new Response('Not found', {
				status: 404,
				headers: { 'Cache-Control': 'no-store' },
			});
}

export const GET: RequestHandler = ({ params, request }) =>
	media(request, params.track, params.kind, false);
export const HEAD: RequestHandler = ({ params, request }) =>
	media(request, params.track, params.kind, true);
