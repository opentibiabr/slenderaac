import { readable } from 'svelte/store';

import { browser } from '$app/environment';

import { type BoostedSelections, pollBoostedSelections } from '$lib/boosted';

export type BoostedStatus = {
	selections: BoostedSelections | null;
	stale: boolean;
};

// Headers and library pages share one browser poller; SSR uses layout data.
export const boostedStatus = readable<BoostedStatus | null>(null, (set) => {
	if (!browser) return;
	set(null);
	let last: BoostedSelections | null = null;
	const stop = pollBoostedSelections(
		(selections) => {
			last = selections;
			set({ selections, stale: false });
		},
		() => set({ selections: last, stale: true }),
	);
	return () => {
		stop();
		set(null);
	};
});
