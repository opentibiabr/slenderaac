import { rangedFileResponse } from '$lib/server/file-response';
import { loadMapCatalog, mapPlaces } from '$lib/server/maps';

import { env } from '$env/dynamic/private';

import type { RequestHandler } from './$types';

function downloadName(contentType: string): string {
	const extensions: Record<string, string> = {
		'image/gif': 'gif',
		'image/jpeg': 'jpg',
		'image/png': 'png',
		'image/webp': 'webp',
	};
	return `world-map.${extensions[contentType] ?? 'img'}`;
}

async function media(
	request: Request,
	asset: string,
	head: boolean,
): Promise<Response> {
	const catalog = await loadMapCatalog(env.MAP_ASSETS_ROOT);
	const area =
		catalog && asset.startsWith('area-')
			? mapPlaces(catalog).find((place) => place.id === asset.slice(5))
			: null;
	const file =
		asset === 'overview'
			? catalog?.overview
			: asset === 'download'
				? catalog?.highResolution
				: area?.image;
	if (!file)
		return new Response('Not found', {
			status: 404,
			headers: { 'Cache-Control': 'no-store' },
		});
	return rangedFileResponse(request, file, {
		head,
		downloadName:
			asset === 'download' ? downloadName(file.contentType) : undefined,
	});
}

export const GET: RequestHandler = ({ params, request }) =>
	media(request, params.asset, false);
export const HEAD: RequestHandler = ({ params, request }) =>
	media(request, params.asset, true);
