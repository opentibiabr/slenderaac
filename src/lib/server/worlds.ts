import { loadWorldConfig } from '$lib/server/catalog';
import { parseWorldConfig } from '$lib/worlds';

import { env } from '$env/dynamic/private';

export async function serverName(): Promise<string> {
	return env.SERVER_NAME?.trim() || (await loadWorldConfig()).name || 'Server';
}

export async function configuredWorld() {
	const imported = await loadWorldConfig();
	return {
		...parseWorldConfig({
			...imported,
			...(env.PVP_TYPE?.trim() ? { pvpType: env.PVP_TYPE.trim() } : {}),
		}),
		name: await serverName(),
	};
}
