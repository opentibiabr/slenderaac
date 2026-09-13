import type { AchievementRecord } from './achievements';

export const MAX_SHOWCASE_ACHIEVEMENTS = 5;

export function showcaseSelection(
	values: unknown[],
	earned: readonly AchievementRecord[],
): number[] | null {
	if (values.length > MAX_SHOWCASE_ACHIEVEMENTS) return null;
	const available = new Set(earned.map((entry) => entry.id));
	const selected: number[] = [];
	for (const value of values) {
		if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
		const id = Number(value);
		if (!available.has(id) || selected.includes(id)) return null;
		selected.push(id);
	}
	return selected;
}

export function selectedAchievements(
	ids: readonly number[],
	earned: readonly AchievementRecord[],
): AchievementRecord[] {
	const available = new Map(earned.map((entry) => [entry.id, entry]));
	return [...new Set(ids)].slice(0, MAX_SHOWCASE_ACHIEVEMENTS).flatMap((id) => {
		const entry = available.get(id);
		return entry ? [entry] : [];
	});
}
