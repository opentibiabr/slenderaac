import { createHash } from 'node:crypto';

import { json } from '@sveltejs/kit';

import {
	mountOutfitId,
	outfitColors,
	outfitImagesPath,
	walkSpeeds,
} from '$lib/server/animations/config';
import { animationFrameCount, loadData } from '$lib/server/animations/metadata';
import { outfit } from '$lib/server/animations/outfits';

import type { RequestHandler } from './$types';

export const GET = (async ({ url, request }) => {
	function parameter(
		key: string,
		fallback: number,
		maximum: number,
		minimum = 0,
	) {
		const text = url.searchParams.get(key);
		if (text === null) return fallback;
		if (!/^\d+$/.test(text)) return null;
		const value = Number(text);
		return Number.isSafeInteger(value) && value >= minimum && value <= maximum
			? value
			: null;
	}
	const looktype = parameter(
		url.searchParams.has('looktype') ? 'looktype' : 'id',
		0,
		65535,
		1,
	);
	const mountValue = parameter('mount', 0, 0xffffffff);
	const head = parameter('lookhead', 0, outfitColors.length - 1);
	const body = parameter('lookbody', 0, outfitColors.length - 1);
	const legs = parameter('looklegs', 0, outfitColors.length - 1);
	const feet = parameter('lookfeet', 0, outfitColors.length - 1);
	const addons = parameter('lookaddons', 0, 3);
	const direction = parameter('direction', 3, 4, 1);
	const resize = parameter('resize', 0, 1);
	const noCache = { 'Cache-Control': 'no-store' };
	if (
		!looktype ||
		mountValue === null ||
		head === null ||
		body === null ||
		legs === null ||
		feet === null ||
		addons === null ||
		direction === null ||
		resize === null
	)
		return json(
			{ frames: [], message: 'Invalid outfit parameters' },
			{ status: 400, headers: noCache },
		);
	let mount = mountOutfitId(mountValue);
	const mountData = mount
		? loadData(mount, outfitImagesPath, { direction })
		: null;
	if (!mountData) mount = 0;
	let data = loadData(looktype, outfitImagesPath, {
		mounted: Boolean(mount),
		direction,
	});
	if (!data && mount) {
		mount = 0;
		data = loadData(looktype, outfitImagesPath, { direction });
	}
	if (!data) return json({ frames: [] }, { status: 404, headers: noCache });
	if (mount && mountData)
		data = {
			...data,
			files: [...data.files, ...mountData.files],
			mountFramesNumber: mountData.framesNumber,
		};
	const frames: { image: string; duration: number }[] = [];
	const count = animationFrameCount(data.framesNumber, data.mountFramesNumber);
	const duration =
		walkSpeeds[Math.max(data.framesNumber, data.mountFramesNumber)] ?? 100;
	for (let frame = 1; frame <= count; frame++) {
		const rendered = await outfit(
			data,
			outfitImagesPath,
			looktype,
			addons,
			head,
			body,
			legs,
			feet,
			mount,
			direction,
			frame,
			resize === 1,
		);
		if (!rendered)
			return json({ frames: [] }, { status: 404, headers: noCache });
		frames.push({
			image: rendered.canvas.toDataURL(),
			duration,
		});
	}
	const response = JSON.stringify({ frames, mounted: Boolean(mount) });
	const etag = '"' + createHash('sha256').update(response).digest('hex') + '"';
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
	return new Response(response, {
		headers: { ...headers, 'Content-Type': 'application/json' },
	});
}) satisfies RequestHandler;
