<script lang="ts">
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import { tick } from 'svelte';

	import { page } from '$app/stores';

	export let attrs: Record<string, string>;
	let trigger: HTMLButtonElement;
	let panel: HTMLSpanElement;
	let open = false;
	let position = '';
	let side = 'right';
	$: tooltipId = `information-tooltip-${attrs.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
	async function show() {
		open = true;
		await tick();
		if (!open || !panel || !trigger) return;
		const result = await computePosition(trigger, panel, {
			placement: 'right-start',
			middleware: [
				offset({ mainAxis: 8, alignmentAxis: 19 }),
				flip(),
				shift({ padding: 8 }),
			],
		});
		position = `left: ${result.x}px; top: ${result.y}px`;
		side = result.placement.split('-')[0];
	}
</script>

<span class="information-tooltip" on:mouseleave={() => (open = false)}>
	<button
		bind:this={trigger}
		type="button"
		aria-label={attrs.title}
		aria-expanded={open}
		aria-describedby={open ? tooltipId : undefined}
		on:mouseenter={show}
		on:focus={show}
		on:blur={() => (open = false)}
		on:click={show}
		on:keydown={(event) => {
			if (event.key === 'Escape') open = false;
		}}><slot /></button>
	{#if open}
		<span
			bind:this={panel}
			role="tooltip"
			id={tooltipId}
			class="information-tooltip__panel"
			class:information-tooltip__panel--left={side === 'left'}
			style={`${position}; --tooltip-paper: url("${$page.data.themeAssets?.paperTexture}"); --tooltip-arrow: url("${attrs['arrow-src']}")`}>
			<strong>{attrs.title}</strong><span class="information-tooltip__text"
				>{attrs['tooltip-text']}</span
			><span class="information-tooltip__ornament"
				><img src={attrs['ornament-src']} alt="" /></span
			><br />
		</span>
	{/if}
</span>

<style>
	:global(.theme-cip-slender) .information-tooltip {
		position: relative;
		display: inline;
	}
	:global(.theme-cip-slender) .information-tooltip button {
		display: inline;
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		vertical-align: baseline;
		cursor: help;
	}
	:global(.theme-cip-slender) .information-tooltip__panel {
		position: absolute;
		z-index: 100;
		display: block;
		box-sizing: content-box;
		width: 225px;
		padding: 10px;
		border: 1px double rgb(90 40 0);
		background-image: var(--tooltip-paper);
		color: rgb(90 40 0);
		font:
			12px Verdana,
			Arial,
			sans-serif;
		text-align: left;
	}
	:global(.theme-cip-slender) .information-tooltip__panel::before {
		position: absolute;
		top: -1px;
		left: -8px;
		width: 8px;
		height: 13px;
		background-image: var(--tooltip-arrow);
		content: '';
	}
	:global(.theme-cip-slender) .information-tooltip__panel--left::before {
		left: auto;
		right: -8px;
		transform: rotate(180deg);
	}
	:global(.theme-cip-slender) .information-tooltip__panel strong {
		display: block;
		margin-bottom: 15px;
		font-size: 16px;
		font-weight: bold;
	}
	:global(.theme-cip-slender) .information-tooltip__text {
		display: block;
		white-space: pre-line;
	}
	:global(.theme-cip-slender) .information-tooltip__ornament {
		display: block;
		text-align: center;
	}
	:global(.theme-cip-slender) .information-tooltip__ornament img {
		width: 220px;
		max-width: 100%;
		height: auto;
	}
</style>
