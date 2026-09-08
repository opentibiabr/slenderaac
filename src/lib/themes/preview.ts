const previewKeys = ['themePreview', 'cipReference', 'cipGrid', 'cipDemo'];

export function themePreviewHref(current: URL, href: string): string {
	let target: URL;
	try {
		target = new URL(href, current);
	} catch {
		return href;
	}
	if (target.origin !== current.origin) return href;
	if (current.searchParams.has('themePreview')) {
		for (const key of previewKeys) {
			const value = current.searchParams.get(key);
			if (value !== null && !target.searchParams.has(key))
				target.searchParams.set(key, value);
		}
	}
	return `${target.pathname}${target.search}${target.hash}`;
}
