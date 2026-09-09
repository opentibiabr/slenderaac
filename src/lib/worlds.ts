import { isOrder, isSort } from '$lib/sorting';

export const worldPvpTypes = {
	'no-pvp': 'Optional PvP',
	pvp: 'Open PvP',
	'retro-pvp': 'Retro Open PvP',
	'pvp-enforced': 'Hardcore PvP',
	'expert-pvp': 'Expert PvP',
} as const;

export type WorldConfig = {
	name?: string;
	location?: string;
	pvpType?: keyof typeof worldPvpTypes;
	maxPlayers?: number;
};

/** Project only public world metadata; never send the server configuration itself. */
export function parseWorldConfig(value: unknown): WorldConfig {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		throw new Error('Invalid world configuration');
	const source = value as Record<string, unknown>;
	const world: WorldConfig = {};
	for (const key of ['name', 'location'] as const) {
		if (source[key] === undefined) continue;
		const text = source[key];
		if (
			typeof text !== 'string' ||
			!text.trim() ||
			text.length > 100 ||
			Array.from(text).some(
				(character) =>
					character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
			)
		)
			throw new Error(`Invalid world ${key}`);
		world[key] = text.trim();
	}
	if (source.pvpType !== undefined) {
		const pvpType =
			typeof source.pvpType === 'string'
				? source.pvpType.trim().toLowerCase()
				: '';
		if (!Object.hasOwn(worldPvpTypes, pvpType))
			throw new Error('Invalid world PvP type');
		world.pvpType = pvpType as WorldConfig['pvpType'];
	}
	if (source.maxPlayers !== undefined) {
		if (
			typeof source.maxPlayers !== 'number' ||
			!Number.isSafeInteger(source.maxPlayers) ||
			source.maxPlayers < 0
		)
			throw new Error('Invalid world player limit');
		world.maxPlayers = source.maxPlayers;
	}
	return world;
}

export function onlineRecord(value: string | undefined): number | null {
	if (value === undefined || !/^\d+$/.test(value)) return null;
	const record = Number(value);
	return Number.isSafeInteger(record) ? record : null;
}

export function worldHref(name?: string): string {
	return name
		? `/worlds?${new URLSearchParams({ world: name }).toString()}`
		: '/worlds';
}

export function worldSorting(query: URLSearchParams) {
	const combined = /^(name|level|vocation)_(asc|desc)$/.exec(
		query.get('order') ?? '',
	);
	const sort = query.get('sort') ?? combined?.[1];
	const order = combined?.[2] ?? query.get('order');
	return {
		sort: isSort(sort) ? sort : ('name' as const),
		order: isOrder(order) ? order : ('asc' as const),
	};
}
