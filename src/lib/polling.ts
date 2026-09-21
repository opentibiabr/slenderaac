export type JsonPollOptions<T> = {
	url: string;
	interval: number;
	timeout?: number;
	parse: (value: unknown) => T | null;
	update: (value: T) => void;
	unavailable?: () => void;
};

/** Keep one request in flight and ignore work completed after the caller stops. */
export function pollJson<T>({
	url,
	interval,
	timeout = 5000,
	parse,
	update,
	unavailable = () => {},
}: JsonPollOptions<T>) {
	let active = true;
	let controller: AbortController | null = null;
	let timer: ReturnType<typeof setTimeout>;

	async function refresh() {
		let received = false;
		controller = new AbortController();
		const request = controller;
		const timeoutTimer = setTimeout(() => request.abort(), timeout);
		try {
			const response = await fetch(url, {
				cache: 'no-store',
				signal: request.signal,
			});
			if (!response.ok) return;
			const value = parse(await response.json());
			if (active && !request.signal.aborted && value !== null) {
				received = true;
				update(value);
			}
		} catch {
			// A later poll can recover from an HTTP, network or parsing failure.
		} finally {
			clearTimeout(timeoutTimer);
			if (active && !received) unavailable();
			if (active) timer = setTimeout(() => void refresh(), interval);
		}
	}

	void refresh();
	return () => {
		active = false;
		clearTimeout(timer);
		controller?.abort();
	};
}
