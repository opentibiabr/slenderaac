/** Keep small result sets fully linked and large result sets bounded. */
export function paginationPages(
	page: number,
	total: number,
): (number | null)[] {
	const last = Math.max(1, total);
	if (last <= 20) return Array.from({ length: last }, (_, index) => index + 1);
	const start = Math.max(2, Math.min(page - 4, last - 9));
	const end = Math.min(last - 1, Math.max(page + 4, 10));
	return [
		1,
		...(start > 2 ? [null] : []),
		...Array.from({ length: end - start + 1 }, (_, index) => start + index),
		...(end < last - 1 ? [null] : []),
		last,
	];
}
export type Pagination = {
	page: number;
	limit: number;
	count: number;
	href: (page: number) => string;
};
