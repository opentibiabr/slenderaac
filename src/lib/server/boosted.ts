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
): BoostedSelectionInspection {
	if (!stored) return { selection: null, state: 'missing' };
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

export function activeBoostedSelection(stored: StoredSelection | null) {
	return inspectBoostedSelection(stored).selection;
}

function selectionLog(
	kind: 'creature' | 'boss',
	stored: StoredSelection | null,
	inspection: BoostedSelectionInspection,
): string {
	if (inspection.selection)
		return `${kind}=active name=${JSON.stringify(inspection.selection.boostname)} race=${inspection.selection.raceid} sourceDay=${JSON.stringify(stored?.date)}`;
	const storedDay = stored ? JSON.stringify(stored.date) : 'none';
	return `${kind}=unavailable reason=${inspection.state} sourceDay=${storedDay}`;
}

function logBoostedSnapshot(
	creature: StoredSelection | null,
	boss: StoredSelection | null,
	creatureInspection: BoostedSelectionInspection,
	bossInspection: BoostedSelectionInspection,
) {
	const fingerprint = JSON.stringify([creature, boss]);
	if (fingerprint === lastLoggedSnapshot) return;
	lastLoggedSnapshot = fingerprint;
	console.info(
		`[boosted] ${selectionLog('creature', creature, creatureInspection)}; ${selectionLog('boss', boss, bossInspection)}`,
	);
}

export async function loadBoostedSelections(): Promise<BoostedSelections> {
	const [boostedCreature, boostedBoss] = await Promise.all([
		prisma.boostedCreature.findFirst({ select: selection }),
		prisma.boostedBoss.findFirst({ select: selection }),
	]);
	const creatureInspection = inspectBoostedSelection(boostedCreature);
	const bossInspection = inspectBoostedSelection(boostedBoss);
	logBoostedSnapshot(
		boostedCreature,
		boostedBoss,
		creatureInspection,
		bossInspection,
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
