<script lang="ts">
	import { page } from '$app/stores';

	import TableSurface from '$lib/themes/classic/TableSurface.svelte';

	import PagePanel from './PagePanel.svelte';

	export let id: string;
	export let title: string;
	export let entries: {
		id: string | number;
		name: string;
		description: string;
	}[] = [];
	export let backToTop = '#top';
	$: classic = $page.data.selectedTheme === 'classic';
</script>

<section
	{id}
	class="description-panel"
	class:description-panel--default={!classic}
	aria-label={title}>
	{#if !classic}<h2 class="h2">{title} <slot name="decoration" /></h2>
		<a class="description-panel__default-back" href={backToTop}>Back to top</a
		>{/if}
	<PagePanel {title} variant="stack">
		<svelte:fragment slot="caption">
			{title}<slot name="decoration" />
			<a
				class="description-panel__back"
				href={backToTop}
				aria-label={`Back to top from ${title}`}>
				{#if $page.data.themeAssets?.backToTop}<img
						src={$page.data.themeAssets.backToTop}
						width="18"
						height="18"
						alt="Back to top" />{:else}↑{/if}
			</a>
		</svelte:fragment>
		<div class="description-panel__entries">
			{#each entries as entry (entry.id)}
				<TableSurface assets={$page.data.themeAssets} width="100%">
					<dl
						class="description-card"
						class:description-card--default={!classic}>
						<dt>{entry.name}</dt>
						<dd>{entry.description}</dd>
					</dl>
				</TableSurface>
			{:else}<TableSurface assets={$page.data.themeAssets} width="100%"
					><div class="description-panel__message"><slot /></div></TableSurface
				>{/each}
		</div>
	</PagePanel>
</section>

<style>
	.description-panel--default {
		margin-bottom: 2rem;
	}
	.description-panel {
		position: relative;
		scroll-margin-top: 100px;
		width: 100%;
	}
	.description-panel__entries {
		display: grid;
		gap: 9px;
	}
	.description-card {
		margin: 0;
	}
	dt {
		font-weight: bold;
	}
	dd {
		margin: 0;
		white-space: pre-line;
	}
	.description-card--default {
		padding: 1rem;
		border: 1px solid rgb(var(--color-surface-500));
		border-radius: 0.25rem;
	}
	.description-panel__message {
		padding: 3px 5px;
	}
	.description-panel__back {
		position: absolute;
		right: 5px;
		top: -3px;
		width: 18px;
		height: 18px;
	}
	.description-panel__default-back {
		display: block;
		margin-bottom: 0.5rem;
		text-align: right;
	}
	:global(.theme-classic) .description-card {
		border: 1px solid #faf0d7;
		font-size: 10pt;
		line-height: 16px;
	}
	:global(.theme-classic) .description-panel__message {
		padding: 2px 5px;
		border: 1px solid #faf0d7;
		line-height: 16px;
	}
	:global(.theme-classic) dt,
	:global(.theme-classic) dd {
		padding: 2px 5px;
	}
	:global(.theme-classic) dt {
		border-bottom: 1px solid #faf0d7;
	}
	:global(.theme-classic) dd {
		background: #f1e0c6;
	}
	:global(.theme-classic) .description-panel__back img {
		width: 18px;
		height: 18px;
		display: block;
	}
</style>
