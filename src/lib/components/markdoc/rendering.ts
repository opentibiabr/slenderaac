import { serverTextAttributes, type ServerIdentity } from '$lib/site-identity';
import { siteHref } from '$lib/themes/navigation';

const elementAttributes = {
	a: ['href'],
	blockquote: [],
	br: [],
	code: [],
	em: [],
	h1: [],
	h2: [],
	h3: [],
	h4: [],
	h5: [],
	h6: [],
	hr: [],
	img: ['src', 'alt'],
	li: [],
	ol: ['start'],
	p: [],
	pre: ['data-language'],
	s: [],
	strong: [],
	table: [],
	tbody: [],
	td: ['align', 'colSpan', 'rowSpan'],
	th: ['width', 'align'],
	thead: [],
	tr: [],
	ul: [],
};

function allowedUrl(value: string, current: URL, attribute: 'href' | 'src') {
	if (!value) return false;
	try {
		const { protocol } = new URL(value, current);
		return (
			protocol === 'https:' ||
			protocol === 'http:' ||
			(attribute === 'href' && (protocol === 'mailto:' || protocol === 'tel:'))
		);
	} catch {
		return false;
	}
}

export function markdocAttributes(
	name: string,
	source: Record<string, unknown>,
	current: URL,
	identity: ServerIdentity,
) {
	if (!Object.hasOwn(elementAttributes, name)) return;

	const attributes: Record<string, string> = {};
	const specific = elementAttributes[name as keyof typeof elementAttributes];
	for (const key of ['id', 'title', 'aria-label', ...specific]) {
		const value = source[key];
		if (typeof value === 'number' && Number.isFinite(value)) {
			if (key === 'start' || key === 'colSpan' || key === 'rowSpan')
				attributes[key] = String(value);
			continue;
		}
		if (typeof value !== 'string') continue;
		if (key === 'href' || key === 'src') {
			const destination = value.trim();
			if (!allowedUrl(destination, current, key)) continue;
			const resolved =
				key === 'href' ? siteHref(current, destination) : destination;
			if (allowedUrl(resolved, current, key)) attributes[key] = resolved;
		} else {
			attributes[key] = value;
		}
	}

	return serverTextAttributes(attributes, identity);
}
