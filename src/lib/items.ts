export const itemSlots = [
	'head',
	'necklace',
	'backpack',
	'armor',
	'right',
	'left',
	'legs',
	'feet',
	'ring',
	'ammo',
] as const;

export type Slot = (typeof itemSlots)[number];

export const emptySlot: Record<Slot, string> = {
	head: 'no_helmet',
	necklace: 'no_necklace',
	backpack: 'no_bagpack',
	armor: 'no_armor',
	right: 'no_handright',
	left: 'no_handleft',
	legs: 'no_legs',
	feet: 'no_boots',
	ring: 'no_ring',
	ammo: 'no_ammo',
};

export type Item = {
	player_id: number;
	sid: number;
	pid: number;
	type: number;
	count: number;
};

export function itemURL(type: number | string) {
	return `/api/items?id=${encodeURIComponent(type.toString())}`;
}

export type ItemImage = { src: string; alt: string };

export function fetchBackground() {
	return fetchItem('empty');
}

export async function fetchItem(id: number | string): Promise<ItemImage> {
	const fallback = { src: '', alt: typeof id === 'number' ? `Item ${id}` : '' };
	try {
		const response = await fetch(itemURL(id));
		if (!response.ok) return fallback;
		const data: unknown = await response.json();
		if (
			!data ||
			typeof data !== 'object' ||
			!('src' in data) ||
			typeof data.src !== 'string'
		)
			return fallback;
		return {
			src: data.src,
			alt:
				'alt' in data && typeof data.alt === 'string' && data.alt
					? data.alt
					: fallback.alt,
		};
	} catch {
		return fallback;
	}
}
