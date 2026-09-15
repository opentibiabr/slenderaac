import type { DailyRewardState } from '$lib/accounts';
import { errorCode, log } from '$lib/server/logging';
import { prisma } from '$lib/server/prisma';

// Canary DailyReward.storages: the server-save cycle and each player's claim.
const lastServerSaveKey = '14110';
const rewardClaimKey = 13412;

export function dailyRewardState(
	serverSave: number,
	claimCycle?: number,
	lastClaim?: number,
): DailyRewardState {
	// Canary returns 1 when its global storage has never been initialized.
	if (!Number.isSafeInteger(serverSave) || serverSave <= 1) return 'unknown';
	return claimCycle === serverSave ||
		(Number.isSafeInteger(lastClaim) && lastClaim! >= serverSave)
		? 'collected'
		: 'uncollected';
}

export async function loadAccountRewardStates(playerIds: number[]) {
	const states = new Map<number, DailyRewardState>();
	if (!playerIds.length) return states;
	try {
		const cycle = await prisma.globalStorage.findUnique({
			where: { key: lastServerSaveKey },
			select: { value: true },
		});
		const serverSave = Number(cycle?.value);
		if (dailyRewardState(serverSave) === 'unknown') return states;
		const [claims, history] = await Promise.all([
			prisma.playerStorage.findMany({
				where: { player_id: { in: playerIds }, key: rewardClaimKey },
				select: { player_id: true, value: true },
			}),
			// Canary records this claim message before the next character save.
			// Other history events (such as streak resets) are not collections.
			prisma.dailyRewardHistory.groupBy({
				by: ['player_id'],
				where: {
					player_id: { in: playerIds },
					timestamp: { gte: serverSave },
					description: { startsWith: 'Claimed reward no.' },
				},
				_max: { timestamp: true },
			}),
		]);
		const savedClaims = new Map(
			claims.map((row) => [row.player_id, row.value]),
		);
		const recentClaims = new Map(
			history.map((row) => [row.player_id, row._max.timestamp ?? undefined]),
		);
		for (const id of playerIds) {
			states.set(
				id,
				dailyRewardState(serverSave, savedClaims.get(id), recentClaims.get(id)),
			);
		}
	} catch (error) {
		log(
			'warn',
			'account.rewards',
			`Status unavailable code=${errorCode(error)}`,
		);
	}
	return states;
}
