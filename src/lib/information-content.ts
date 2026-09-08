import { informationDestination } from './information';

export type InformationNode =
	| string
	| { tag: string; attrs: Record<string, string>; children: InformationNode[] };

export type InformationPresentation = {
	version: 1;
	id: string;
	headline: { src: string; width: number; height: number };
	body: InformationNode[];
	gallery?: InformationGallery;
};

export type InformationGallery = {
	background: string;
	items: { id: number; thumbnail: string; src: string; caption: string }[];
};

const tags = new Set([
	'sup',
	'h2',
	'table-frame',
	'table-surface',
	'table',
	'tbody',
	'thead',
	'tr',
	'td',
	'th',
	'tooltip',
	'h3',
	'action',
	'p',
	'div',
	'center',
	'span',
	'b',
	'strong',
	'em',
	'i',
	'ul',
	'ol',
	'li',
	'br',
	'img',
	'a',
]);
const classes = new Set([
	'ContactTable',
	'CompactTable',
	'LabelV150',
	'GreedyCell',
	'NoWrap',
	'Alternate',
	'ContentImageLeftFloat',
	'ContentImageRightFloat',
	'BulletPointList',
	'SpacedParagraph',
	'TableContent',
	'ComparisonTable',
	'Odd',
	'Even',
	'LabelV',
	'TextCenter',
	'TextStrong',
	'IconOffset',
]);

export function informationAsset(value: unknown): value is string {
	return (
		typeof value === 'string' &&
		/^\/theme-assets\/cip-slender\/(?:[\w-]+\/)*[\w.-]+\.(?:gif|png|jpe?g|webp)(?:\?v=[\w-]+)?$/i.test(
			value,
		) &&
		!value.includes('..')
	);
}

export function informationAttributes(attrs: Record<string, unknown>) {
	const safe: Record<string, string> = {};
	for (const [key, value] of Object.entries(attrs)) {
		if (typeof value !== 'string') continue;
		if (key === 'src' && informationAsset(value)) safe.src = value;
		if (key === 'hover-src' && informationAsset(value)) safe[key] = value;
		if (['arrow-src', 'ornament-src'].includes(key) && informationAsset(value))
			safe[key] = value;
		if (['title', 'tooltip-text'].includes(key)) safe[key] = value;
		if (key === 'href' && /^(https?:\/\/|\/(?!\/)|#)/.test(value))
			safe.href = informationDestination(value);
		if (key === 'alt') safe.alt = value;
		if (key === 'target' && value === '_blank') {
			safe.target = '_blank';
			safe.rel = 'noopener noreferrer';
		}
		if (key === 'class')
			safe.class = value
				.split(/\s+/)
				.filter((name) => classes.has(name))
				.join(' ');
		if (
			key === 'align' &&
			/^(left|right|center|top|middle|bottom)$/.test(value)
		)
			safe.align = value;
		if (['width', 'height'].includes(key) && /^\d{1,4}%?$/.test(value))
			safe[key] = value;
	}
	return safe;
}

/** Parse once on the server; render only these attributes, never raw source HTML. */
export function parseInformationPresentation(
	value: unknown,
	id: string,
): InformationPresentation | null {
	if (!value || typeof value !== 'object') return null;
	const data = value as InformationPresentation;
	if (
		data.version !== 1 ||
		data.id !== id ||
		!data.headline ||
		!informationAsset(data.headline.src) ||
		![data.headline.width, data.headline.height].every(
			(size) => Number.isInteger(size) && size > 0 && size <= 1000,
		)
	)
		return null;
	let count = 0;
	function nodes(input: unknown, depth = 0): InformationNode[] {
		if (!Array.isArray(input) || depth > 32)
			throw new Error('Invalid information document');
		return (input as unknown[]).map((value) => {
			if (++count > 30000) throw new Error('Information document is too large');
			if (typeof value === 'string') return value;
			if (!value || typeof value !== 'object')
				throw new Error('Invalid information element');
			const node = value as Record<string, unknown>;
			if (
				!node ||
				typeof node.tag !== 'string' ||
				!tags.has(node.tag) ||
				!node.attrs ||
				typeof node.attrs !== 'object'
			)
				throw new Error('Unsupported information element');
			return {
				tag: node.tag,
				attrs: informationAttributes(node.attrs as Record<string, unknown>),
				children: nodes(node.children, depth + 1),
			};
		});
	}
	try {
		if (
			data.gallery &&
			(!informationAsset(data.gallery.background) ||
				!Array.isArray(data.gallery.items) ||
				!data.gallery.items.length ||
				data.gallery.items.length > 200 ||
				!data.gallery.items.every(
					(item, index) =>
						item.id === index + 1 &&
						informationAsset(item.thumbnail) &&
						informationAsset(item.src) &&
						typeof item.caption === 'string',
				))
		)
			return null;
		return {
			version: 1,
			id,
			headline: data.headline,
			body: nodes(data.body),
			...(data.gallery ? { gallery: data.gallery } : {}),
		};
	} catch {
		return null;
	}
}
