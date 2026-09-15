/** Cumulative experience for a level, using the server's integer progression. */
export function experienceForLevel(level: number): bigint {
	if (!Number.isSafeInteger(level) || level < 1)
		throw new RangeError('Level must be a positive integer');
	const value = BigInt(level);
	return ((((value - 6n) * value + 17n) * value - 12n) / 6n) * 100n;
}
