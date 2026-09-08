import fs from 'node:fs/promises';
import path from 'node:path';

import { parseInformationPresentation } from '$lib/information-content';

import { env } from '$env/dynamic/private';

export async function loadInformationPresentation(theme: string, id: string) {
	if (theme !== 'cip-slender' || !env.THEME_ASSETS_ROOT || !/^[a-z]+$/.test(id))
		return null;
	try {
		const root = await fs.realpath(
			path.join(env.THEME_ASSETS_ROOT, 'cip-slender'),
		);
		const file = await fs.realpath(
			path.join(root, 'reference', 'pages', `${id}.json`),
		);
		const relative = path.relative(root, file);
		if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
		const stat = await fs.stat(file);
		if (!stat.isFile() || stat.size > 2_000_000) return null;
		return parseInformationPresentation(
			JSON.parse(await fs.readFile(file, 'utf8')),
			id,
		);
	} catch {
		return null;
	}
}
