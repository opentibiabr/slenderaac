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

export function activeBoostedSelection(
	stored: StoredSelection | null,
	today: number,
) {
	if (
		!stored ||
		Number(stored.date) !== today ||
		!stored.boostname?.trim() ||
		stored.boostname.trim().toLowerCase() === 'default' ||
		!/^\d+$/.test(stored.raceid) ||
		Number(stored.raceid) <= 0
	)
		return null;

	return {
		boostname: stored.boostname,
		raceid: stored.raceid,
		looktype: stored.looktype,
		lookaddons: stored.lookaddons,
		lookhead: stored.lookhead,
		lookbody: stored.lookbody,
		looklegs: stored.looklegs,
		lookfeet: stored.lookfeet,
		lookmount: stored.lookmount,
	};
}

export async function loadBoostedSelections(
	now = new Date(),
): Promise<BoostedSelections> {
	const [boostedCreature, boostedBoss] = await Promise.all([
		prisma.boostedCreature.findFirst({ select: selection }),
		prisma.boostedBoss.findFirst({ select: selection }),
	]);
	const today = now.getDate();
	return {
		boostedCreature: activeBoostedSelection(boostedCreature, today),
		boostedBoss: activeBoostedSelection(boostedBoss, today),
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
