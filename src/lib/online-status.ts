export type OnlineCounters = {
	twitchChannels: number | null;
	twitchViewers: number | null;
	youtubeChannels: number | null;
	youtubeViewers: number | null;
};

export type OnlineStatus = {
	serverOnline: boolean;
	onlinePlayerCount: number;
	topbarStats: OnlineCounters;
};

export function onlineCounter(value: unknown): number | null {
	return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
		? value
		: null;
}

function parseStatus(value: unknown): OnlineStatus | null {
	if (!value || typeof value !== 'object') return null;
	const status = value as Record<string, unknown>;
	if (
		typeof status.serverOnline !== 'boolean' ||
		typeof status.onlinePlayerCount !== 'number' ||
		!Number.isSafeInteger(status.onlinePlayerCount) ||
		status.onlinePlayerCount < 0
	)
		return null;
	const counters =
		status.topbarStats && typeof status.topbarStats === 'object'
			? (status.topbarStats as Record<string, unknown>)
			: {};
	return {
		serverOnline: status.serverOnline,
		onlinePlayerCount: status.onlinePlayerCount,
		topbarStats: {
			twitchChannels: onlineCounter(counters.twitchChannels),
			twitchViewers: onlineCounter(counters.twitchViewers),
			youtubeChannels: onlineCounter(counters.youtubeChannels),
			youtubeViewers: onlineCounter(counters.youtubeViewers),
		},
	};
}

/** One bounded request at a time; failures preserve the last published value. */
export function pollOnlineStatus(update: (status: OnlineStatus) => void) {
	let active = true;
	let controller: AbortController;
	let timer: ReturnType<typeof setTimeout>;

	async function refresh() {
		controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);
		try {
			const response = await fetch('/api/online-status', {
				signal: controller.signal,
			});
			if (!response.ok) return;
			const status = parseStatus(await response.json());
			if (active && !controller.signal.aborted && status) update(status);
		} catch {
			// A later poll can recover from an HTTP, network or parsing failure.
		} finally {
			clearTimeout(timeout);
			if (active) timer = setTimeout(() => void refresh(), 5000);
		}
	}

	void refresh();
	return () => {
		active = false;
		clearTimeout(timer);
		controller.abort();
	};
}
