export type ServerIdentity = { name: string; website: string };

/** Resolve display text only; URLs, anchors and stored identifiers stay intact. */
export function serverText(value: string, identity: ServerIdentity): string {
	return value.replace(
		/\{\{(serverName|serverWebsite)\}\}/g,
		(_, key: string) =>
			key === 'serverName' ? identity.name : identity.website,
	);
}

export function serverTextAttributes(
	attrs: Record<string, string>,
	identity: ServerIdentity,
): Record<string, string> {
	return Object.fromEntries(
		Object.entries(attrs).map(([key, value]) => [
			key,
			['alt', 'title', 'aria-label', 'tooltip-text'].includes(key)
				? serverText(value, identity)
				: value,
		]),
	);
}
