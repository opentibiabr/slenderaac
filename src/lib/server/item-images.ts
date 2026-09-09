import fs from 'node:fs/promises';
import path from 'node:path';

import protobuf from 'protobufjs';

import { emptySlot, type ItemImage } from '$lib/items';

const placeholders = new Set(['empty', ...Object.values(emptySlot)]);
// The Node SSR runtime exposes this CommonJS package through its default export.
// eslint-disable-next-line import/no-named-as-default-member
const { load: loadProtobuf } = protobuf;

export function itemImageId(value: string | null): string | null {
	if (!value) return null;
	if (placeholders.has(value)) return value;
	if (!/^\d{1,10}$/.test(value)) return null;
	const number = Number(value);
	return number > 0 && number <= 0xffffffff ? String(number) : null;
}

/** Optional artwork and titles are loaded only when a requested image exists. */
export function createItemImageLoader(
	imagesRoot: string,
	metadata = { data: 'appearances.dat', proto: 'appearances.proto' },
) {
	let titles: {
		stamp: string;
		value: Promise<Map<number, string>>;
	} | null = null;

	async function title(id: string) {
		if (!/^\d+$/.test(id)) return '';
		try {
			const [dataStat, protoStat] = await Promise.all([
				fs.stat(metadata.data),
				fs.stat(metadata.proto),
			]);
			if (
				!dataStat.isFile() ||
				!protoStat.isFile() ||
				dataStat.size > 64_000_000 ||
				protoStat.size > 1_000_000
			)
				return '';
			const stamp = [dataStat, protoStat]
				.map((stat) => `${stat.mtimeMs}:${stat.ctimeMs}:${stat.size}`)
				.join('|');
			if (titles?.stamp !== stamp) {
				titles = {
					stamp,
					value: (async () => {
						const [root, buffer] = await Promise.all([
							loadProtobuf(metadata.proto),
							fs.readFile(metadata.data),
						]);
						const records: unknown = root
							.lookupType('Appearances')
							.decode(buffer)
							.toJSON().object;
						const names = new Map<number, string>();
						if (Array.isArray(records))
							for (const row of records as unknown[])
								if (
									row &&
									typeof row === 'object' &&
									'id' in row &&
									'name' in row &&
									typeof row.id === 'number' &&
									typeof row.name === 'string'
								)
									names.set(row.id, row.name);
						return names;
					})().catch(() => new Map<number, string>()),
				};
			}
			return (await titles.value).get(Number(id)) ?? '';
		} catch {
			return '';
		}
	}

	return async (value: string): Promise<ItemImage | null> => {
		const id = itemImageId(value);
		if (!id) return null;
		try {
			const root = await fs.realpath(imagesRoot);
			const file = await fs.realpath(path.join(root, `${id}.gif`));
			const relative = path.relative(root, file);
			if (
				path.isAbsolute(relative) ||
				relative === '..' ||
				relative.startsWith(`..${path.sep}`)
			)
				return null;
			const stat = await fs.stat(file);
			if (!stat.isFile() || stat.size < 14 || stat.size > 8_000_000)
				return null;
			const bytes = await fs.readFile(file);
			if (
				bytes.length !== stat.size ||
				!['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6)) ||
				bytes.at(-1) !== 0x3b
			)
				return null;
			return {
				src: `data:image/gif;base64,${bytes.toString('base64')}`,
				alt: await title(id),
			};
		} catch {
			return null;
		}
	};
}
