import type { BoostedSelections } from '$lib/boosted';
import { prisma } from '$lib/server/prisma';

const selection = {
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

export async function loadBoostedSelections(): Promise<BoostedSelections> {
	const [boostedCreature, boostedBoss] = await Promise.all([
		prisma.boostedCreature.findFirst({ select: selection }),
		prisma.boostedBoss.findFirst({ select: selection }),
	]);
	return { boostedCreature, boostedBoss };
}
