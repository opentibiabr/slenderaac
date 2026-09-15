export type StoryChapter = {
	slug: string;
	title: string;
	content: string;
	order: number;
};

const storySlug = /^genesis-[1-9]\d*$/;

/** Keep story content in the existing static-page publisher without leaking it into generic menus. */
export function storyChapters(records: StoryChapter[]): StoryChapter[] {
	return records
		.filter((record) => storySlug.test(record.slug))
		.sort(
			(a, b) =>
				a.order - b.order ||
				Number(a.slug.slice('genesis-'.length)) -
					Number(b.slug.slice('genesis-'.length)),
		);
}

export function storyPage(value: string | null, total: number): number | null {
	if (total === 0) return value === null || value === '1' ? 0 : null;
	if (value === null) return 0;
	if (!/^[1-9]\d*$/.test(value)) return null;
	const page = Number(value);
	return Number.isSafeInteger(page) && page <= total ? page - 1 : null;
}

export function romanNumeral(value: number): string {
	if (!Number.isSafeInteger(value) || value < 1 || value > 3999)
		return String(value);
	const numerals: [number, string][] = [
		[1000, 'M'],
		[900, 'CM'],
		[500, 'D'],
		[400, 'CD'],
		[100, 'C'],
		[90, 'XC'],
		[50, 'L'],
		[40, 'XL'],
		[10, 'X'],
		[9, 'IX'],
		[5, 'V'],
		[4, 'IV'],
		[1, 'I'],
	];
	let remainder = value;
	let result = '';
	for (const [amount, numeral] of numerals)
		while (remainder >= amount) {
			result += numeral;
			remainder -= amount;
		}
	return result;
}
