import { tick } from 'svelte';

export type PortalTarget = HTMLElement | string;

export function portal(node: HTMLElement, target: PortalTarget = 'body') {
	let destroyed = false;

	async function update(nextTarget: PortalTarget = 'body') {
		let destination: HTMLElement;
		if (typeof nextTarget === 'string') {
			let match = document.querySelector<HTMLElement>(nextTarget);
			if (!match) {
				await tick();
				match = document.querySelector<HTMLElement>(nextTarget);
			}
			if (destroyed) return;
			if (!match)
				throw new Error(`No portal target found for selector "${nextTarget}"`);
			destination = match;
		} else {
			destination = nextTarget;
		}
		if (destroyed) return;
		destination.appendChild(node);
		node.hidden = false;
	}

	void update(target);
	return {
		update,
		destroy() {
			destroyed = true;
			node.remove();
		},
	};
}
