export type Sort = 'name' | 'level' | 'vocation';
export function isSort(value: unknown): value is Sort {
	if (typeof value !== 'string') return false;
	return ['name', 'level', 'vocation'].includes(value);
}

export type Order = 'asc' | 'desc';
export function isOrder(value: unknown): value is Order {
	if (typeof value !== 'string') return false;
	return ['asc', 'desc'].includes(value);
}

export function sortHref(
	url: URL,
	column: Sort,
	sort: Sort,
	order: Order,
	initialOrder: Order = 'asc',
) {
	const target = new URL(url);
	target.searchParams.set('sort', column);
	target.searchParams.set(
		'order',
		sort === column ? (order === 'asc' ? 'desc' : 'asc') : initialOrder,
	);
	return target.pathname + target.search + target.hash;
}
