<script lang="ts">
	import { page } from '$app/stores';

	import TableFrame from '$lib/themes/classic/TableFrame.svelte';
	import TableSurface from '$lib/themes/classic/TableSurface.svelte';

	export let title: string;
	export let compact = false;
	export let surface = false;
</script>

{#if $page.data.selectedTheme === 'classic'}
	<section
		class="classic-page-panel"
		class:classic-page-panel--compact={compact}
		class:classic-page-panel--surface={surface}>
		<TableFrame assets={$page.data.themeAssets}>
			<svelte:fragment slot="caption">{title}</svelte:fragment>
			<div class="classic-page-panel__body">
				{#if surface}<TableSurface
						assets={$page.data.themeAssets}
						width="100%"
						bordered={false}><slot /></TableSurface
					>{:else}<slot />{/if}
			</div>
		</TableFrame>
	</section>
{:else}
	<slot />
{/if}

<style>
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
	:global(.theme-classic) .classic-page-panel--compact {
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
</style>
