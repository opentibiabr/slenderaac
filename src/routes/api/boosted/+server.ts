import { json } from '@sveltejs/kit';

import { loadBoostedSelections } from '$lib/server/boosted';
import { diagnosticsEnabled, diagnosticStep } from '$lib/server/diagnostics';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () =>
	json(
		await diagnosticStep('database.boosted', () =>
			loadBoostedSelections(diagnosticsEnabled),
		),
		{
			headers: { 'Cache-Control': 'private, no-store' },
		},
	);
