export type HouseDefinition = {
	id: number;
	clientId?: number;
	bedCapacity?: number;
	guildhall: boolean;
	entry: { x: number; y: number; z: number };
};

export type PublicHouse = {
	id: number;
	name: string;
	townId: number;
	town: string;
	size: number;
	rent: number;
	beds: number;
	owner: string | null;
	rented: boolean;
	bid: number;
	bidEnd: number;
	definition?: HouseDefinition;
};

export const houseOrders = {
	name: 'by name',
	size: 'by size',
	rent: 'by rent',
	bid: 'by bid',
	end: 'by auction end',
} as const;

export function parseHouseDefinitions(value: unknown): HouseDefinition[] {
	if (!Array.isArray(value)) throw new Error('Invalid house definitions');
	const ids = new Set<number>();
	return value.map((item: unknown) => {
		if (!item || typeof item !== 'object' || Array.isArray(item))
			throw new Error('Invalid house definition');
		const entry = item as Record<string, unknown>;
		if (
			!entry.entry ||
			typeof entry.entry !== 'object' ||
			Array.isArray(entry.entry)
		)
			throw new Error('Invalid house position');
		const position = entry.entry as Record<string, unknown>;
		const integer = (value: unknown, max = 0x7fffffff): value is number =>
			typeof value === 'number' &&
			Number.isInteger(value) &&
			value >= 0 &&
			value <= max;
		if (
			!integer(entry.id) ||
			entry.id === 0 ||
			ids.has(entry.id) ||
			typeof entry.guildhall !== 'boolean' ||
			(entry.clientId !== undefined && !integer(entry.clientId)) ||
			(entry.bedCapacity !== undefined && !integer(entry.bedCapacity)) ||
			!integer(position.x, 65535) ||
			!integer(position.y, 65535) ||
			!integer(position.z, 15)
		)
			throw new Error('Invalid or duplicate house definition');
		ids.add(entry.id);
		return {
			id: entry.id,
			...(entry.clientId !== undefined ? { clientId: entry.clientId } : {}),
			...(entry.bedCapacity !== undefined
				? { bedCapacity: entry.bedCapacity }
				: {}),
			guildhall: entry.guildhall,
			entry: { x: position.x, y: position.y, z: position.z },
		};
	});
}

export function houseFilters(query: URLSearchParams, towns: string[]) {
	const order = query.get('order') || 'name';
	const state = query.get('state') || '';
	const type = query.get('type') || 'houses';
	return {
		town: query.get('town') ?? towns[0] ?? '',
		state: ['auctioned', 'rented'].includes(state) ? state : '',
		type: type === 'guildhalls' ? 'guildhalls' : 'houses',
		order: Object.hasOwn(houseOrders, order)
			? (order as keyof typeof houseOrders)
			: ('name' as const),
	};
}

export function selectHouses(
	houses: PublicHouse[],
	filters: ReturnType<typeof houseFilters>,
) {
	return houses
		.filter(
			(house) =>
				house.town === filters.town &&
				(!filters.state || house.rented === (filters.state === 'rented')) &&
				house.definition?.guildhall === (filters.type === 'guildhalls'),
		)
		.sort((a, b) => {
			if (filters.order === 'end') {
				const difference = (a.bidEnd || Infinity) - (b.bidEnd || Infinity);
				if (difference && Number.isFinite(difference)) return difference;
				if (a.bidEnd && !b.bidEnd) return -1;
				if (!a.bidEnd && b.bidEnd) return 1;
			} else if (filters.order !== 'name') {
				const difference = b[filters.order] - a[filters.order];
				if (difference) return difference;
			}
			return a.name.localeCompare(b.name, 'en') || a.id - b.id;
		});
}

export function houseHref(query: URLSearchParams, id?: number) {
	const parameters = new URLSearchParams(query);
	parameters.delete('page');
	parameters.delete('houseid');
	if (id !== undefined) parameters.set('houseid', String(id));
	return `/houses${parameters.size ? `?${parameters.toString()}` : ''}`;
}
