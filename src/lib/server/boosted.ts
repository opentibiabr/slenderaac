import type { BoostedProps, BoostedSelections } from '$lib/boosted';
import { errorCode, log, startLogOperation } from '$lib/server/logging';
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
let lastLoggedSource = '';

async function diagnoseUnavailableSource() {
	const finish = startLogOperation('database.boosted.inspect', 'debug');
	try {
		// Read a bounded sample separately; never change which row supplies the UI.
		const samples = await Promise.all([
			prisma.boostedCreature.findMany({
				select: selection,
				orderBy: { date: 'asc' },
				take: 6,
			}),
			prisma.boostedBoss.findMany({
				select: selection,
				orderBy: { date: 'asc' },
				take: 6,
			}),
		]);
		const source = JSON.stringify(
			samples.map((rows, index) => ({
				table: index === 0 ? 'boosted_creature' : 'boosted_boss',
				moreRows: rows.length > 5,
				rows: rows.slice(0, 5).map((row) => ({
					...row,
					date: row.date.slice(0, 32),
					boostname: row.boostname?.slice(0, 128) ?? null,
					raceid: row.raceid.slice(0, 32),
					state: inspectBoostedSelection(row).state,
				})),
			})),
		);
		if (source !== lastLoggedSource) {
			lastLoggedSource = source;
			log('debug', 'boosted.source', source);
		}
		finish();
	} catch (error) {
		// Optional inspection must not discard the successfully loaded selections.
		finish(`failed code=${errorCode(error)}`, 'warn');
	}
}

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
	const unavailable =
		!creatureInspection.selection || !bossInspection.selection;
	log(
		unavailable ? 'warn' : 'info',
		'boosted',
		`${selectionLog('creature', creature, creatureInspection)}; ${selectionLog('boss', boss, bossInspection)}${unavailable ? ". Verify that the game server has written its daily selections and check the database.config startup log. Set SERVER_CONFIG_FILE to the running server's config.lua to share its database settings. Unavailable selections alone do not prove a database mismatch." : ''}`,
	);
}

export async function loadBoostedSelections(
	diagnoseUnavailable = false,
): Promise<BoostedSelections> {
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
	if (diagnoseUnavailable) {
		if (!creatureInspection.selection || !bossInspection.selection) {
			await diagnoseUnavailableSource();
		} else {
			lastLoggedSource = '';
		}
	}
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
