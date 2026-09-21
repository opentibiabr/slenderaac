import { pollJson } from '$lib/polling';

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

/** A database presence row alone cannot establish a live connection. */
export function playerOnline(
	recordedOnline: boolean,
	serverOnline: boolean | null,
): boolean | null {
	return !recordedOnline || serverOnline === false ? false : serverOnline;
}

export function onlineCounter(value: unknown): number | null {
	return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
		? value
		: null;
}

export function parseOnlineStatus(value: unknown): OnlineStatus | null {
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

/** One bounded request at a time; report failures without inventing a new value. */
export function pollOnlineStatus(
	update: (status: OnlineStatus) => void,
	unavailable: () => void = () => {},
) {
	return pollJson({
		url: '/api/online-status',
		interval: 5000,
		parse: parseOnlineStatus,
		update,
		unavailable,
	});
}
