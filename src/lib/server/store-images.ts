import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { normalizeAssetPath } from '$lib/server/theme-assets/paths';

/** The client keeps its existing /images/store URL in either website layout. */
export async function storeImage(
	root: string,
	name: string,
	request: Request,
): Promise<Response> {
	const missing = () =>
		new Response('Not found', {
			status: 404,
			headers: { 'Cache-Control': 'no-store' },
		});
	const normalized = normalizeAssetPath(name);
	if (!normalized || !/^[A-Za-z0-9_/ &'().-]+\.(?:png|gif)$/.test(normalized))
		return missing();
	try {
		const directory = await fs.realpath(root);
		const file = await fs.realpath(path.join(directory, normalized));
		const relative = path.relative(directory, file);
		if (
			path.isAbsolute(relative) ||
			relative === '..' ||
			relative.startsWith(`..${path.sep}`)
		)
			return missing();
		const stat = await fs.stat(file);
		if (!stat.isFile() || stat.size < 20 || stat.size > 8_000_000)
			return missing();
		const bytes = await fs.readFile(file);
		// Catalog filenames are stable; some .png names contain animated GIFs.
		const png =
			bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) &&
			bytes.subarray(-8).equals(Buffer.from('49454e44ae426082', 'hex'));
		const gif =
			['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6)) &&
			bytes.at(-1) === 0x3b;
		if (!png && !gif) return missing();
		const etag = '"' + createHash('sha256').update(bytes).digest('hex') + '"';
		const headers = {
			'Cache-Control': 'public, max-age=0, must-revalidate',
			'Content-Type': png ? 'image/png' : 'image/gif',
			'X-Content-Type-Options': 'nosniff',
			ETag: etag,
		};
		const matches = request.headers
			.get('if-none-match')
			?.split(',')
			.some((value) => {
				const tag = value.trim().replace(/^W\//, '');
				return tag === '*' || tag === etag;
			});
		return new Response(matches ? null : bytes, {
			status: matches ? 304 : 200,
			headers,
		});
	} catch {
		return missing();
	}
}
