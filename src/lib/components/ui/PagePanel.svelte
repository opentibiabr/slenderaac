<script lang="ts">
	import { page } from '$app/stores';

	import TableFrame from '$lib/themes/classic/TableFrame.svelte';
	import TableSurface from '$lib/themes/classic/TableSurface.svelte';

	export let title: string;
	export let compact = false;
	export let surface = false;
	export let spacing: 'default' | 'related' | 'section' = 'default';
	export let variant:
		| 'native'
		| 'list'
		| 'form'
		| 'stack'
		| 'paged'
		| 'plain'
		| 'flush'
		| 'message' = 'native';
</script>

{#if $page.data.selectedTheme === 'classic'}
	<section
		class="classic-page-panel"
		class:classic-page-panel--list={variant === 'list'}
		class:classic-page-panel--form={variant === 'form'}
		class:classic-page-panel--stack={variant === 'stack' || variant === 'paged'}
		class:classic-page-panel--paged={variant === 'paged'}
		class:classic-page-panel--plain={variant === 'plain'}
		class:classic-page-panel--flush={variant === 'flush'}
		class:classic-page-panel--message={variant === 'message'}
		class:classic-page-panel--related={spacing === 'related'}
		class:classic-page-panel--section={spacing === 'section'}
		class:classic-page-panel--compact={compact}
		class:classic-page-panel--surface={surface}>
		<TableFrame assets={$page.data.themeAssets}>
			<svelte:fragment slot="caption"
				><slot name="caption">{title}</slot></svelte:fragment>
			<div class="classic-page-panel__body">
				<slot name="before-surface" />
				{#if surface}<TableSurface
						assets={$page.data.themeAssets}
						width="100%"
						bordered={variant !== 'native'}><slot /></TableSurface
					>{:else}<slot />{/if}
				<slot name="after-surface" />
			</div>
		</TableFrame>
		<slot name="decoration" />
	</section>
{:else}
	<slot name="before-surface" />
	<slot />
	<slot name="after-surface" />
{/if}

<style>
	:global(.theme-classic) .classic-page-panel--plain .classic-page-panel__body {
		padding: 5px;
	}
	:global(.theme-classic) .classic-page-panel--flush .classic-page-panel__body {
		padding: 1px 0 0;
	}
	:global(.theme-classic) .classic-page-panel--list,
	:global(.theme-classic) .classic-page-panel--form {
		display: flow-root;
	}
	:global(.theme-classic)
		.classic-page-panel--form.classic-page-panel--surface {
		margin-bottom: 15px;
	}
	:global(.theme-classic)
		.classic-page-panel--list.classic-page-panel--surface
		.classic-page-panel__body {
		padding: 8px 7px 8px 6px;
	}
	:global(.theme-classic)
		.classic-page-panel--form.classic-page-panel--surface
		.classic-page-panel__body {
		padding: 4px 13px 8px 6px;
	}
	:global(
		.theme-classic
			.classic-page-panel--form.classic-page-panel
			.classic-table-frame__rail
	) {
		background: rgb(212 192 161);
	}
	:global(.theme-classic) .classic-page-panel {
		width: calc(100% + 2px);
		margin-bottom: 20px;
		font:
			13.333333px Verdana,
			Arial,
			sans-serif;
	}
	:global(.theme-classic) .classic-page-panel__body {
		padding: 8px;
		font:
			13.333333px Verdana,
			Arial,
			sans-serif;
	}
	:global(.theme-classic .classic-page-panel .classic-table-frame__rail) {
		background: rgb(212 192 161);
	}
	:global(.theme-classic) .classic-page-panel.classic-page-panel--compact {
		margin-bottom: 0;
	}
	:global(.theme-classic) .classic-page-panel--surface {
		margin-bottom: 30px;
	}
	:global(.theme-classic)
		.classic-page-panel--surface
		.classic-page-panel__body {
		padding: 9px 8px 9px 7px;
	}
	:global(
		.theme-classic .classic-page-panel--surface .classic-table-frame__rail
	) {
		background: rgb(241 224 197);
	}
	:global(.theme-classic) .classic-page-panel--stack {
		display: flow-root;
		margin-bottom: 30px;
	}
	:global(.theme-classic) .classic-page-panel--stack .classic-page-panel__body {
		padding: 8px 7px 8px 6px;
	}
	:global(.theme-classic) .classic-page-panel--paged .classic-page-panel__body {
		padding-bottom: 2px;
	}
	:global(
		.theme-classic .classic-page-panel--stack .classic-table-frame__rail
	) {
		background: rgb(241 224 197);
	}
	:global(.theme-classic) .classic-page-panel--plain,
	:global(.theme-classic) .classic-page-panel--flush {
		display: flow-root;
		margin-bottom: 15px;
	}
	:global(.theme-classic) .classic-page-panel--plain {
		position: relative;
		--classic-table-rail-background: rgb(212 192 161);
	}
	:global(
		.theme-classic .classic-page-panel--flush .classic-table-frame__rail
	) {
		background: rgb(241 224 197);
	}
	:global(.theme-classic)
		.classic-page-panel--message
		.classic-page-panel__body {
		padding: 6px 6px 3px;
		line-height: 18px;
	}
	:global(.theme-classic) .classic-page-panel--message {
		display: flow-root;
	}
	:global(.theme-classic) .classic-page-panel--related {
		margin-bottom: 15px;
	}
	:global(.theme-classic) .classic-page-panel--section {
		margin-bottom: 30px;
	}
</style>
