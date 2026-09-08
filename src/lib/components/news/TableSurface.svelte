<script lang="ts">
	import { page } from '$app/stores';

	import CipTableSurface from '$lib/themes/cip-slender/TableSurface.svelte';

	export let assets: Record<string, string | undefined> | null | undefined;
	export let width: number | string;
	export let bordered = true;
</script>

{#if $page.data.selectedTheme === 'cip-slender'}
	<CipTableSurface {assets} {width} {bordered}><slot /></CipTableSurface>
{:else}
	<div class="news-table-surface"><slot /></div>
{/if}

<style>
	.news-table-surface {
		width: 100%;
		min-width: 0;
		overflow-x: auto;
	}
</style>
