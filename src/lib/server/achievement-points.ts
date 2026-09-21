import { storageNumber } from './storage-values';

/** Missing native points are zero; malformed stored points are unavailable. */
export function achievementPoints(
	value: Uint8Array | null | undefined,
): number | null {
	if (value === undefined) return 0;
	const points = value === null ? null : storageNumber(value);
	return points !== null &&
		Number.isInteger(points) &&
		points >= 0 &&
		points <= 65535
		? points
		: null;
}
