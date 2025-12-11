import { error, json } from '@sveltejs/kit';
import { existsSync, readdirSync, writeFileSync } from 'fs';
import path, { relative, resolve } from 'path';
import { outfitImagesPath, walkSpeeds } from '$lib/server/animations/config';
import {
	loadData,
	outfit,
	type OutfitData,
} from '$lib/server/animations/outfits';

import type { RequestHandler } from './$types';
import { parseIntWithDefault } from './parseIntWithDefault';

const CACHE_FILE_PATH = './cache.generated.txt';

function getFilesSync(dir: string): string[] {
	const dirents = readdirSync(dir, { withFileTypes: true });
	const files = dirents
		.map((dirent) => {
			const res = relative('.', resolve(dir, dirent.name));
			return dirent.isDirectory() ? getFilesSync(res) : res;
		})
		.flat();

	return files;
}

function generateCacheIfNeeded(): boolean {
	if (!existsSync(CACHE_FILE_PATH)) {
		const dirIterator = getFilesSync(outfitImagesPath);
		const outfits: { [outfitId: string]: OutfitData } = {};
		const frameNumbers = Array(10).fill(0);

		for (const filePath of dirIterator) {
			const normalizedFilePath = filePath.replaceAll('\\', '/');
			const outfitIdData = path.dirname(normalizedFilePath).split('/');
			const outfitId = outfitIdData[outfitIdData.length - 1];

			if (!outfits[outfitId]) {
				outfits[outfitId] = {
					files: [],
					framesNumber: 0,
					mountFramesNumber: 0,
				};
			}

			const fileName = path.basename(normalizedFilePath);
			outfits[outfitId].files.push(normalizedFilePath);

			const currentFramesNumber = parseInt(fileName.charAt(0));
			if (Number.isNaN(currentFramesNumber)) {
				continue;
			}
			outfits[outfitId].framesNumber = Math.max(
				outfits[outfitId].framesNumber,
				currentFramesNumber,
			);
		}

		for (const outfitId in outfits) {
			const outfit = outfits[outfitId];
			const serializedOutfit = JSON.stringify(outfit);
			const outfitDataFilePath = path.join(
				outfitImagesPath,
				outfitId,
				'outfit.data.json',
			);

			try {
				writeFileSync(outfitDataFilePath, serializedOutfit);
			} catch (err) {
				console.error(
					`Node.js cannot write to: "${outfitDataFilePath}", check directory access rights`,
				);
			}

			frameNumbers[outfit.framesNumber]++;
		}

		const cacheGeneratedFilePath = CACHE_FILE_PATH;
		try {
			writeFileSync(cacheGeneratedFilePath, 'cache generated');
		} catch (err) {
			console.log(
				`Node.js cannot write to: "${cacheGeneratedFilePath}", check directory access rights`,
			);
			process.exit(1);
		}

		console.log('FILE SYSTEM CACHE GENERATED');
		console.log('Animation frames count in loaded outfits:', frameNumbers);

		return true;
	}
	return false;
}

export const GET = (async ({ url, request }) => {
	generateCacheIfNeeded();

	const headers = {
		'Cache-Control': `max-age=${60 * 60 * 24 * 365}`,
		Expires: new Date(Date.now() + 60 * 60 * 24 * 365 * 1000).toUTCString(),
		'Last-Modified': new Date(1337).toUTCString(),
	};

	if (url.host) {
		const ifModifiedSince = request.headers.get('if-modified-since');
		if (ifModifiedSince) {
			return new Response(null, {
				status: 304,
				headers,
			});
		}
	}

	const looktype = parseIntWithDefault(url.searchParams.get('looktype') || url.searchParams.get('id'));
	let outfitData = loadData(looktype, outfitImagesPath, false);
	if (!outfitData) {
		return json({});
	}
	let mount = parseIntWithDefault(url.searchParams.get('mount'));

	if (mount > 0) {
		const mountOutfitData = loadData(mount, outfitImagesPath, true, outfitData);
		if (mountOutfitData) {
			outfitData = mountOutfitData;
		} else {
			mount = 0;
		}
	}

	if (!outfitData) {
		throw error(404, 'Outfit not found');
	}

	const head = parseIntWithDefault(url.searchParams.get('lookhead'));
	const body = parseIntWithDefault(url.searchParams.get('lookbody'));
	const legs = parseIntWithDefault(url.searchParams.get('looklegs'));
	const feet = parseIntWithDefault(url.searchParams.get('lookfeet'));
	const addons = parseIntWithDefault(url.searchParams.get('lookaddons'));
	const direction = parseIntWithDefault(url.searchParams.get('direction'), 3);
	const resize = parseIntWithDefault(url.searchParams.get('resize'), 0);

	const frames: CanvasRenderingContext2D[] = [];
	const durations: number[] = [];

	const moveAnimFrames: number = outfitData?.framesNumber;

	for (
		let moveAnimFrame = 1;
		moveAnimFrame <= moveAnimFrames;
		++moveAnimFrame
	) {
		const frame = await outfit(
			outfitData,
			outfitImagesPath,
			looktype,
			addons,
			head,
			body,
			legs,
			feet,
			mount,
			direction,
			moveAnimFrame,
			resize === 1,
		);
		if (!frame) {
			throw error(500, 'Failed to create canvas frame');
		}
		frames.push(frame as unknown as CanvasRenderingContext2D);
		durations.push(walkSpeeds[moveAnimFrames]);
	}

	return json({
		frames: frames.map((frame, index) => ({
			image: frame.canvas.toDataURL(),
			duration: durations[index],
		})),
	});
}) satisfies RequestHandler;
