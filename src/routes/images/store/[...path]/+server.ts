import { storeImage } from '$lib/server/store-images';

import { env } from '$env/dynamic/private';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params, request }) =>
	storeImage(
		env.STORE_ASSETS_ROOT || './static/images/store',
		params.path,
		request,
	);
