import invariant from 'tiny-invariant';

export function parseIntWithDefault(value: unknown, def = 0): number {
	if (value === null || value === undefined) return def;

	invariant(
		typeof value === 'string' || typeof value === 'number',
		'value must be a string or number found ' + typeof value + ' instead',
	);
	if (typeof value === 'number') {
		return Number.isNaN(value) ? def : value;
	}

	const parsedValue = parseInt(value as string, 10);
	return Number.isNaN(parsedValue) ? def : parsedValue;
}
