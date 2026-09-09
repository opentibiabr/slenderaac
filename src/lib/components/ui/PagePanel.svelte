<script lang="ts">
	import { page } from '$app/stores';

	import TableFrame from '$lib/themes/cip-slender/TableFrame.svelte';
	import TableSurface from '$lib/themes/cip-slender/TableSurface.svelte';

	export let title: string;
	export let compact = false;
	export let surface = false;
</script>

{#if $page.data.selectedTheme === 'cip-slender'}
	<section
		class="cip-page-panel"
		class:cip-page-panel--compact={compact}
		class:cip-page-panel--surface={surface}>
		<TableFrame assets={$page.data.themeAssets}>
			<svelte:fragment slot="caption">{title}</svelte:fragment>
			<div class="cip-page-panel__body">
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
	:global(.theme-cip-slender) .cip-page-panel {
		width: calc(100% + 2px);
		margin-bottom: 20px;
		font:
			13.333333px Verdana,
			Arial,
			sans-serif;
	}
	:global(.theme-cip-slender) .cip-page-panel__body {
		padding: 8px;
		font:
			13.333333px Verdana,
			Arial,
			sans-serif;
	}
	:global(.theme-cip-slender .cip-page-panel .cip-table-frame__rail) {
		background: rgb(212 192 161);
	}
	:global(.theme-cip-slender) .cip-page-panel--compact {
		margin-bottom: 0;
	}
	:global(.theme-cip-slender) .cip-page-panel--surface {
		margin-bottom: 30px;
	}
	:global(.theme-cip-slender) .cip-page-panel--surface .cip-page-panel__body {
		padding: 9px 8px 9px 7px;
	}
	:global(.theme-cip-slender .cip-page-panel--surface .cip-table-frame__rail) {
		background: rgb(241 224 197);
	}
</style>
