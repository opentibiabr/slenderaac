<script lang="ts">
	import {
		autoUpdate,
		computePosition,
		flip,
		offset,
		shift,
	} from '@floating-ui/dom';
	import { onDestroy, tick } from 'svelte';
	import { portal } from 'svelte-portal';

	import { page } from '$app/stores';

	import {
		calendarTooltipSections,
		type TooltipSection,
	} from './tooltip-content';

	export let attrs: Record<string, string>;
	export let id = '';
	export let calendar = false;
	export let block = false;
	export let calendarSections: TooltipSection[] | undefined = undefined;
	let trigger: HTMLButtonElement;
	let panel: HTMLSpanElement;
	let open = false;
	let position = '';
	let side = 'right';
	let stopPositioning: (() => void) | undefined;
	$: title = attrs.title ?? '';
	$: tooltipId =
		id ||
		`information-tooltip-${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
	$: sections =
		calendarSections ??
		calendarTooltipSections(attrs['tooltip-text'] ?? '', title);
	function backgroundImage(src: unknown) {
		return typeof src === 'string' && src ? `url("${src}")` : 'none';
	}
	function hide() {
		open = false;
		stopPositioning?.();
		stopPositioning = undefined;
	}
	onDestroy(hide);
	function mountPanel(node: HTMLElement) {
		if (calendar) {
			const root = trigger.closest<HTMLElement>('.theme-cip-slender');
			if (root) return portal(node, root);
		}
	}
	async function show() {
		open = true;
		await tick();
		if (!open || !panel || !trigger) return;
		if (calendar && !stopPositioning)
			stopPositioning = autoUpdate(trigger, panel, () => void updatePosition());
		else await updatePosition();
	}
	async function updatePosition() {
		if (!open || !panel || !trigger) return;
		const result = await computePosition(trigger, panel, {
			placement: 'right-start',
			middleware: [
				offset({ mainAxis: 8, alignmentAxis: calendar ? 0 : 19 }),
				flip(),
				shift({ padding: 8 }),
			],
		});
		position = `left: ${result.x}px; top: ${result.y}px`;
		side = result.placement.split('-')[0];
	}
</script>

<span
	class="information-tooltip"
	role="presentation"
	class:information-tooltip--block={block}
	on:mouseleave={hide}>
	<button
		bind:this={trigger}
		type="button"
		aria-label={title || undefined}
		aria-expanded={open}
		aria-describedby={open ? tooltipId : undefined}
		on:mouseenter={show}
		on:focus={show}
		on:blur={hide}
		on:click={show}
		on:keydown={(event) => {
			if (event.key === 'Escape') hide();
		}}><slot /></button>
	{#if open}
		<span
			bind:this={panel}
			use:mountPanel
			role="tooltip"
			id={tooltipId}
			class="information-tooltip__panel"
			class:information-tooltip__panel--calendar={calendar}
			class:information-tooltip__panel--left={side === 'left'}
			style={`${position}; --tooltip-paper: ${backgroundImage($page.data.themeAssets?.paperTexture)}; --tooltip-arrow: ${backgroundImage(attrs['arrow-src'])}`}>
			<strong aria-hidden={calendar ? true : undefined}
				>{calendar ? '' : title}</strong>
			{#if calendar}
				{#each sections as section}
					<span class="information-tooltip__section-title"
						>{section.title}</span>
					{#if section.text}<span class="information-tooltip__section-text"
							>{section.text}</span
						>{/if}
				{/each}
			{:else}<span class="information-tooltip__text"
					>{attrs['tooltip-text']}</span
				>{/if}<span class="information-tooltip__ornament"
				>{#if attrs['ornament-src']}<img
						src={attrs['ornament-src']}
						alt="" />{/if}</span
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
	:global(.theme-cip-slender) .information-tooltip--block,
	:global(.theme-cip-slender) .information-tooltip--block button {
		display: block;
		width: 100%;
		text-align: inherit;
	}
	:global(.theme-cip-slender) .information-tooltip--block button {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
	:global(.theme-cip-slender) .information-tooltip__section-title {
		display: block;
		font-size: 16px;
		font-weight: bold;
		word-break: break-word;
	}
	:global(.theme-cip-slender) .information-tooltip__section-text {
		display: block;
		margin-bottom: 20px;
		text-align: justify;
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
	:global(.theme-cip-slender)
		.information-tooltip__panel--calendar
		.information-tooltip__ornament
		img {
		display: inline;
		vertical-align: baseline;
	}
</style>
