export const MAX_CONFIRMATION_ATTEMPTS = 10;

/** Refresh only pending orders, with one invalidation in flight at a time. */
export function pollOrderConfirmation(
	refresh: () => Promise<void>,
	isPending: () => boolean,
	onAttempt: (attempts: number) => void,
) {
	let active = true;
	let attempts = 0;
	let timer: ReturnType<typeof setTimeout>;

	function schedule() {
		if (active && isPending() && attempts < MAX_CONFIRMATION_ATTEMPTS) {
			timer = setTimeout(() => void poll(), 1000);
		}
	}

	async function poll() {
		if (!active || !isPending()) return;
		try {
			await refresh();
		} catch {
			// Keep the last server status; failed refreshes also consume the retry budget.
		}
		if (!active) return;
		onAttempt(++attempts);
		schedule();
	}

	schedule();
	return () => {
		active = false;
		clearTimeout(timer);
	};
}
