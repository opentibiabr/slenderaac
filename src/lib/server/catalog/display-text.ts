/** Prepare operator-owned display copy without changing native lookup identities. */
export function catalogDisplayText(value: unknown) {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		throw new Error('Invalid display text map');
	const pairs = Object.entries(value);
	if (pairs.length > 100) throw new Error('Display text map is too large');
	const replacements = new Map<string, string>();
	for (const [key, replacement] of pairs) {
		if (
			!key.trim() ||
			key.length > 100 ||
			typeof replacement !== 'string' ||
			replacement.length > 500 ||
			replacements.has(key.toLowerCase())
		)
			throw new Error('Invalid or duplicate display text replacement');
		replacements.set(key.toLowerCase(), replacement);
	}
	const pattern = pairs
		.map(([key]) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.sort((a, b) => b.length - a.length)
		.join('|');
	const expression = new RegExp(
		`(?<![\\p{L}\\p{N}_])(?:${pattern})(?![\\p{L}\\p{N}_])`,
		'giu',
	);
	return (text: string) =>
		pairs.length
			? text.replace(
					expression,
					(match) => replacements.get(match.toLowerCase())!,
				)
			: text;
}
