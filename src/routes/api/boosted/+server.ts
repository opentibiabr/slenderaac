import { json } from '@sveltejs/kit';

import { loadBoostedSelections } from '$lib/server/boosted';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () =>
	json(await loadBoostedSelections(), {
		headers: { 'Cache-Control': 'private, no-store' },
	});
