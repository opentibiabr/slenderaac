export const directoryLanguages = {
	ar: 'Arabic',
	nl: 'Dutch',
	en: 'English',
	fi: 'Finnish',
	fr: 'French',
	de: 'German',
	pl: 'Polish',
	pt: 'Portuguese',
	es: 'Spanish',
	sv: 'Swedish',
	tr: 'Turkish',
} as const;

export const directoryContent = {
	statistics: 'Statistics',
	articles: 'Articles and news',
	tools: 'Tools',
	wiki: 'Wiki',
} as const;

export const directorySocials = {
	facebook: 'Facebook',
	twitter: 'Twitter',
	twitch: 'Twitch',
	youtube: 'YouTube',
	instagram: 'Instagram',
	reddit: 'Reddit',
	discord: 'Discord',
} as const;

export type DirectoryKind = 'fansite' | 'reseller';
export type DirectoryDetails = {
	languages: string[];
	content: string[];
	socials: string[];
	countries: string[];
	contactCharacter: string;
	email: string;
	address: string;
	telephone: string;
	mobile: string;
	contact: string;
	logoAsset: string;
	itemAsset: string;
};

export type DirectoryRecord = {
	id: string;
	kind: string;
	name: string;
	url: string;
	description: string;
	promoted: boolean;
	featured: boolean;
	details: DirectoryDetails;
	contactExists: boolean;
};

export function directoryUrl(value: string) {
	try {
		const url = new URL(value);
		if (
			!['https:', 'http:'].includes(url.protocol) ||
			url.username ||
			url.password ||
			value.length > 2048
		)
			return null;
		return url.href;
	} catch {
		return null;
	}
}

export function directoryCountry(code: string) {
	if (!/^[A-Z]{2}$/.test(code) || code === 'ZZ') return null;
	const name = new Intl.DisplayNames(['en'], {
		type: 'region',
		fallback: 'none',
	}).of(code);
	return name && name !== code ? name : null;
}

export function directoryDetails(value: unknown): DirectoryDetails {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		throw new Error('Invalid directory details');
	const data = value as Record<string, unknown>;
	const words = (key: string, limit: number) => {
		const text = data[key] ?? '';
		if (typeof text !== 'string' || text.length > limit)
			throw new Error(`Invalid ${key}`);
		return text.trim();
	};
	const list = (
		key: string,
		valid: (item: string) => boolean,
		limit: number,
	) => {
		const items = data[key] ?? [];
		if (
			!Array.isArray(items) ||
			items.length > limit ||
			items.some((item) => typeof item !== 'string' || !valid(item))
		)
			throw new Error(`Invalid ${key}`);
		return [...new Set(items as string[])];
	};
	const asset = (key: string) => {
		const value = words(key, 100);
		if (value && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value))
			throw new Error('Invalid image asset key');
		return value;
	};
	const email = words('email', 254);
	if (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))
		throw new Error('Invalid email address');
	return {
		languages: list(
			'languages',
			(item) => Object.hasOwn(directoryLanguages, item),
			11,
		),
		content: list(
			'content',
			(item) => Object.hasOwn(directoryContent, item),
			4,
		),
		countries: list('countries', (item) => !!directoryCountry(item), 250),
		socials: list(
			'socials',
			(item) => Object.hasOwn(directorySocials, item),
			7,
		),
		email,
		contactCharacter: words('contactCharacter', 255),
		address: words('address', 1000),
		telephone: words('telephone', 255),
		mobile: words('mobile', 255),
		contact: words('contact', 2000),
		logoAsset: asset('logoAsset'),
		itemAsset: asset('itemAsset'),
	};
}

export function directoryInput(data: FormData) {
	const text = (key: string) =>
		typeof data.get(key) === 'string' ? (data.get(key) as string).trim() : '';
	const name = text('name'),
		kind = text('kind'),
		url = directoryUrl(text('url')),
		description = text('description');
	if (
		!name ||
		name.length > 255 ||
		!['fansite', 'reseller'].includes(kind) ||
		!url ||
		description.length > 8000
	)
		return null;
	try {
		const csv = (key: string) =>
			text(key)
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean);
		const details = directoryDetails({
			languages: data.getAll('languages'),
			content: data.getAll('content'),
			countries: csv('countries').map((code) => code.toUpperCase()),
			socials: data.getAll('socials'),
			...Object.fromEntries(
				[
					'contactCharacter',
					'email',
					'address',
					'telephone',
					'mobile',
					'contact',
					'logoAsset',
					'itemAsset',
				].map((key) => [key, text(key)]),
			),
		});
		if (kind === 'reseller' && !details.countries.length) return null;
		return {
			name,
			kind,
			url,
			description,
			details,
			promoted: kind === 'fansite' && data.get('promoted') === 'on',
			featured: kind === 'fansite' && data.get('featured') === 'on',
			published: data.get('published') === 'on',
		};
	} catch {
		return null;
	}
}

export function directoryFilterHref(url: URL, group: string, value: string) {
	const next = new URL(url);
	const selected = new Set(next.searchParams.getAll(group));
	next.searchParams.delete(group);
	if (value) {
		if (selected.has(value)) selected.delete(value);
		else selected.add(value);
		for (const item of selected) next.searchParams.append(group, item);
	}
	return next.pathname + next.search;
}

export function filterFansites(
	entries: DirectoryRecord[],
	params: URLSearchParams,
) {
	const languages = params.getAll('language'),
		socials = params.getAll('social'),
		content = params.getAll('content');
	return entries.filter(
		(entry) =>
			(!languages.length ||
				languages.some((value) => entry.details.languages.includes(value))) &&
			(!socials.length ||
				socials.some((value) => entry.details.socials.includes(value))) &&
			(!content.length ||
				content.some((value) => entry.details.content.includes(value))),
	);
}

export function directoryEditorValues(data: FormData) {
	const limits = {
		name: 255,
		kind: 16,
		url: 2048,
		description: 8000,
		contactCharacter: 255,
		email: 254,
		address: 1000,
		telephone: 255,
		mobile: 255,
		contact: 2000,
		logoAsset: 100,
		itemAsset: 100,
		countries: 1000,
		promoted: 2,
		featured: 2,
		published: 2,
	};
	const values = Object.fromEntries(
		Object.entries(limits).map(([key, limit]) => {
			const value = data.get(key);
			return [key, typeof value === 'string' ? value.slice(0, limit) : ''];
		}),
	);
	for (const key of ['languages', 'content', 'socials'])
		values[key] = data
			.getAll(key)
			.filter((item): item is string => typeof item === 'string')
			.join(',')
			.slice(0, 200);
	return values;
}
