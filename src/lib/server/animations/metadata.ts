import fs from 'node:fs';
import path from 'node:path';

export type OutfitData = {
	files: string[];
	framesNumber: number;
	mountFramesNumber: number;
};

type Index = { files: string[]; frames: Map<string, Set<number>> };
const cache = new Map<string, { stamp: number; index: Index }>();

export function animationFrameCount(outfitFrames: number, mountFrames = 1) {
	let divisor = outfitFrames;
	let remainder = mountFrames;
	while (remainder) [divisor, remainder] = [remainder, divisor % remainder];
	const count = (outfitFrames / divisor) * mountFrames;
	if (!Number.isSafeInteger(count) || count < 1 || count > 128)
		throw new Error('Combined outfit animation exceeds the frame limit');
	return count;
}

export function normalizedImagePath(file: string) {
	return file.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/$/, '');
}

/** Index only the requested outfit, without writing files into the sprite pack. */
export function loadData(
	outfitId: number,
	root: string,
	options: { mounted?: boolean; direction?: number } = {},
): OutfitData | null {
	if (!Number.isSafeInteger(outfitId) || outfitId < 1 || outfitId > 65535)
		return null;
	const directory = path.join(root, String(outfitId));
	let stat: fs.Stats;
	try {
		stat = fs.statSync(directory);
	} catch (error) {
		if (
			['ENOENT', 'ENOTDIR'].includes(
				(error as NodeJS.ErrnoException).code ?? '',
			)
		)
			return null;
		throw error;
	}
	if (!stat.isDirectory()) return null;
	let entry = cache.get(directory);
	if (!entry || entry.stamp !== stat.mtimeMs) {
		const index: Index = { files: [], frames: new Map() };
		for (const file of fs.readdirSync(directory, { withFileTypes: true })) {
			if (
				!file.isFile() ||
				!/^[1-9]\d*_[12]_[123]_[1234](?:_template)?\.png$/.test(file.name)
			)
				continue;
			index.files.push(normalizedImagePath(path.join(directory, file.name)));
			const base = /^([1-9]\d*)_([12])_1_([1234])\.png$/.exec(file.name);
			if (!base) continue;
			const frame = Number(base[1]);
			if (frame > 128)
				throw new Error('Outfit animation exceeds the frame limit');
			const key = `${base[2]}_${base[3]}`;
			if (!index.frames.has(key)) index.frames.set(key, new Set());
			index.frames.get(key)!.add(frame);
		}
		entry = { stamp: stat.mtimeMs, index };
		if (cache.size >= 5000) cache.clear();
		cache.set(directory, entry);
	}
	const frames = entry.index.frames.get(
		`${options.mounted ? 2 : 1}_${options.direction ?? 3}`,
	);
	if (!frames?.size) return null;
	const count = Math.max(...frames);
	if (frames.size !== count)
		throw new Error('Outfit animation has missing frames');
	return {
		files: entry.index.files,
		framesNumber: count,
		mountFramesNumber: 1,
	};
}
