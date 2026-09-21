/** Restrict post-login redirects to rooted paths on the current site. */
export function localReturnTo(value: string | null, current: URL): string {
	const fallback = '/account';
	if (!value || !/^(\/(?!\/)|https?:\/\/)/.test(value)) return fallback;
	for (const character of value) {
		const code = character.charCodeAt(0);
		if (character === '\\' || code <= 32 || code === 127) return fallback;
	}
	try {
		const target = new URL(value, current);
		if (
			target.origin !== current.origin ||
			target.username ||
			target.password ||
			target.pathname.startsWith('//')
		)
			return fallback;
		return `${target.pathname}${target.search}${target.hash}`;
	} catch {
		return fallback;
	}
}
