import { pollJson } from '$lib/polling';

export type BoostedProps = {
	boostname: string | null;
	raceid: string;
	looktype: number;
	lookaddons: number;
	lookhead: number;
	lookbody: number;
	looklegs: number;
	lookfeet: number;
	lookmount: number | null;
};

export type BoostedSelections = {
	boostedCreature: BoostedProps | null;
	boostedBoss: BoostedProps | null;
};

export const boostedRefreshInterval = 5 * 60 * 1000;

const appearanceFields = [
	'looktype',
	'lookaddons',
	'lookhead',
	'lookbody',
	'looklegs',
	'lookfeet',
] as const;

function boostedSelection(value: unknown): BoostedProps | null | undefined {
	if (value === null) return null;
	if (!value || typeof value !== 'object') return;
	const selection = value as Record<string, unknown>;
	const raceId =
		typeof selection.raceid === 'string'
			? Number(selection.raceid)
			: Number.NaN;
	if (
		(selection.boostname !== null && typeof selection.boostname !== 'string') ||
		typeof selection.raceid !== 'string' ||
		!/^\d+$/.test(selection.raceid) ||
		!Number.isSafeInteger(raceId) ||
		raceId < 0 ||
		raceId > 65535 ||
		appearanceFields.some(
			(field) =>
				!Number.isSafeInteger(selection[field]) ||
				Number(selection[field]) < 0 ||
				Number(selection[field]) > 65535,
		) ||
		(selection.lookmount !== null &&
			(!Number.isSafeInteger(selection.lookmount) ||
				Number(selection.lookmount) < 0 ||
				Number(selection.lookmount) > 65535))
	)
		return;
	return selection as BoostedProps;
}

export function parseBoostedSelections(
	value: unknown,
): BoostedSelections | null {
	if (!value || typeof value !== 'object') return null;
	const response = value as Record<string, unknown>;
	const boostedCreature = boostedSelection(response.boostedCreature);
	const boostedBoss = boostedSelection(response.boostedBoss);
	if (boostedCreature === undefined || boostedBoss === undefined) return null;
	return { boostedCreature, boostedBoss };
}

export function pollBoostedSelections(
	update: (selections: BoostedSelections) => void,
	unavailable: () => void = () => {},
) {
	return pollJson({
		url: '/api/boosted',
		interval: boostedRefreshInterval,
		parse: parseBoostedSelections,
		update,
		unavailable,
	});
}
