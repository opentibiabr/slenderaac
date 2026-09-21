export type KillTotals = {
	race: string;
	dayPlayers: number;
	dayMonsters: number;
	weekPlayers: number;
	weekMonsters: number;
};

export type CollectionInterval = {
	started_at: number;
	updated_at: number;
	dropped_events: number;
};

/** Only completed minutes contribute to a rolling day/week. */
export function killWindow(now: number) {
	const end = Math.floor(now / 60);
	return { end, day: end - 1440, week: end - 7 * 1440 };
}

export function collectionCoverage(
	intervals: CollectionInterval[],
	now: number,
) {
	const window = killWindow(now);
	const start = window.week * 60;
	const end = window.end * 60;
	const relevant = intervals
		.filter((entry) => entry.updated_at >= start)
		.sort((a, b) => a.started_at - b.started_at);
	let coveredUntil = start;
	let gap = false;
	for (const entry of relevant) {
		if (entry.started_at > coveredUntil) gap = true;
		coveredUntil = Math.max(coveredUntil, entry.updated_at);
	}
	const updated = relevant.length
		? Math.max(...relevant.map((entry) => entry.updated_at))
		: null;
	return {
		started: relevant.length ? relevant[0].started_at : null,
		updated,
		stale: updated === null || now - updated > 120,
		partial:
			!relevant.length ||
			gap ||
			coveredUntil < end ||
			relevant.some((entry) => entry.dropped_events > 0),
	};
}
