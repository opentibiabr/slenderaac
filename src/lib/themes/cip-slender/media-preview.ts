export type MediaPreview = {
	kind: 'image' | 'video';
	src: string;
	label: string;
};

export function mediaPreview(
	kind: string | undefined,
	href: string,
	origin: string,
): MediaPreview | null {
	let url: URL;
	try {
		url = new URL(href, origin);
	} catch {
		return null;
	}
	if (
		kind === 'image' &&
		url.origin === origin &&
		url.pathname.startsWith('/theme-assets/cip-slender/')
	) {
		return {
			kind,
			src: `${url.pathname}${url.search}`,
			label: 'Selected image displayed in large format',
		};
	}
	if (kind !== 'video' || url.protocol !== 'https:') return null;
	const youtube = ['youtube.com', 'www.youtube.com', 'm.youtube.com'];
	const id =
		url.hostname === 'youtu.be'
			? url.pathname.slice(1)
			: youtube.includes(url.hostname)
				? url.pathname === '/watch'
					? url.searchParams.get('v')
					: url.pathname.match(/^\/embed\/([\w-]+)$/)?.[1]
				: null;
	if (!id || !/^[\w-]{11}$/.test(id)) return null;
	return {
		kind,
		src: `https://www.youtube.com/embed/${id}?enablejsapi=1`,
		label: 'Tibia - Official Trailer',
	};
}
