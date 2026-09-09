import { createHash } from 'node:crypto';

import { json } from '@sveltejs/kit';

import { createItemImageLoader, itemImageId } from '$lib/server/item-images';

import type { RequestHandler } from './$types';

const loadImage = createItemImageLoader(
	process.env.ITEM_ASSETS_ROOT || './items',
);
const noCache = { 'Cache-Control': 'no-store' };

export const GET = (async ({ url, request }) => {
	const id = itemImageId(url.searchParams.get('id'));
	if (!id)
		return json(
			{ src: '', alt: '', message: 'Invalid item identity' },
			{ status: 400, headers: noCache },
		);
	const image = await loadImage(id);
	if (!image)
		return json({ src: '', alt: '' }, { status: 404, headers: noCache });
	const body = JSON.stringify(image);
	const etag = '"' + createHash('sha256').update(body).digest('hex') + '"';
	const headers = {
		'Cache-Control': 'public, max-age=0, must-revalidate',
		ETag: etag,
	};
	if (
		request.headers
			.get('if-none-match')
			?.split(',')
			.some((value) => {
				const validator = value.trim().replace(/^W\//, '');
				return validator === '*' || validator === etag;
			})
	)
		return new Response(null, { status: 304, headers });
	return new Response(body, {
		headers: { ...headers, 'Content-Type': 'application/json' },
	});
}) satisfies RequestHandler;
