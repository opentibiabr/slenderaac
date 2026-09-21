import { derived, readable } from 'svelte/store';

import { browser } from '$app/environment';

import { type OnlineStatus, pollOnlineStatus } from '$lib/online-status';

// All live indicators share one poller; SSR never starts a request or stores user data.
export const onlineStatus = readable<
	(OnlineStatus & { stale: boolean }) | null
>(null, (set) => {
	if (!browser) return;
	set(null);
	let last: OnlineStatus | null = null;
	const stop = pollOnlineStatus(
		(status) => {
			last = status;
			set({ ...status, stale: false });
		},
		() => {
			if (last) set({ ...last, stale: true });
		},
	);
	return () => {
		stop();
		set(null);
	};
});

export const serverAvailability = derived(onlineStatus, (status) =>
	status?.stale ? null : (status?.serverOnline ?? null),
);
