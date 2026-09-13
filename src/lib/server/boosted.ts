import type { BoostedProps, BoostedSelections } from '$lib/boosted';
import { prisma } from '$lib/server/prisma';

const selection = {
	date: true,
	boostname: true,
	raceid: true,
	looktype: true,
	lookaddons: true,
	lookhead: true,
	lookbody: true,
	looklegs: true,
	lookfeet: true,
	lookmount: true,
} as const;

type StoredSelection = BoostedProps & { date: string };

export type BoostedSelectionState =
	| 'active'
	| 'missing'
	| 'stale-day'
	| 'invalid-name'
	| 'placeholder'
	| 'invalid-race';

export type BoostedSelectionInspection = {
	selection: BoostedProps | null;
	state: BoostedSelectionState;
};

let lastLoggedSnapshot = '';

export function inspectBoostedSelection(
	stored: StoredSelection | null,
	today: number,
): BoostedSelectionInspection {
	if (!stored) return { selection: null, state: 'missing' };
	if (Number(stored.date) !== today)
		return { selection: null, state: 'stale-day' };
	if (!stored.boostname?.trim())
		return { selection: null, state: 'invalid-name' };
	if (stored.boostname.trim().toLowerCase() === 'default')
		return { selection: null, state: 'placeholder' };
	if (!/^\d+$/.test(stored.raceid) || Number(stored.raceid) <= 0)
		return { selection: null, state: 'invalid-race' };

	return {
		selection: {
			boostname: stored.boostname,
			raceid: stored.raceid,
			looktype: stored.looktype,
			lookaddons: stored.lookaddons,
			lookhead: stored.lookhead,
			lookbody: stored.lookbody,
			looklegs: stored.looklegs,
			lookfeet: stored.lookfeet,
			lookmount: stored.lookmount,
		},
		state: 'active',
	};
}

export function activeBoostedSelection(
	stored: StoredSelection | null,
	today: number,
) {
	return inspectBoostedSelection(stored, today).selection;
}

function selectionLog(
	kind: 'creature' | 'boss',
	stored: StoredSelection | null,
	inspection: BoostedSelectionInspection,
	today: number,
): string {
	if (inspection.selection)
		return `${kind}=active name=${JSON.stringify(inspection.selection.boostname)} race=${inspection.selection.raceid} day=${today}`;
	const storedDay = stored ? JSON.stringify(stored.date) : 'none';
	return `${kind}=unavailable reason=${inspection.state} storedDay=${storedDay} expectedDay=${today}`;
}

function logBoostedSnapshot(
	creature: StoredSelection | null,
	boss: StoredSelection | null,
	creatureInspection: BoostedSelectionInspection,
	bossInspection: BoostedSelectionInspection,
	today: number,
) {
	const fingerprint = JSON.stringify([today, creature, boss]);
	if (fingerprint === lastLoggedSnapshot) return;
	lastLoggedSnapshot = fingerprint;
	console.info(
		`[boosted] ${selectionLog('creature', creature, creatureInspection, today)}; ${selectionLog('boss', boss, bossInspection, today)}`,
	);
}

export async function loadBoostedSelections(
	now = new Date(),
): Promise<BoostedSelections> {
	const [boostedCreature, boostedBoss] = await Promise.all([
		prisma.boostedCreature.findFirst({ select: selection }),
		prisma.boostedBoss.findFirst({ select: selection }),
	]);
	const today = now.getDate();
	const creatureInspection = inspectBoostedSelection(boostedCreature, today);
	const bossInspection = inspectBoostedSelection(boostedBoss, today);
	logBoostedSnapshot(
		boostedCreature,
		boostedBoss,
		creatureInspection,
		bossInspection,
		today,
	);
	return {
		boostedCreature: creatureInspection.selection,
		boostedBoss: bossInspection.selection,
	};
}

/** Keep the client status response aligned with the website's daily validation. */
export function boostedClientResponse(selections: BoostedSelections) {
	const creature = selections.boostedCreature
		? Number(selections.boostedCreature.raceid)
		: null;
	const boss = selections.boostedBoss
		? Number(selections.boostedBoss.raceid)
		: null;
	return {
		boostedcreature: creature !== null || boss !== null,
		...(creature !== null ? { creatureraceid: creature } : {}),
		...(boss !== null ? { bossraceid: boss } : {}),
	};
}
