<script lang="ts">
	import { page } from '$app/stores';

	import ClassicTableSurface from '$lib/themes/classic/TableSurface.svelte';

	export let assets: Record<string, string | undefined> | null | undefined;
	// The default theme keeps its responsive surface, without Classic sprite sizing.
	export let width: number | string;
	export let bordered = true;
</script>

{#if $page.data.selectedTheme === 'classic'}
	<ClassicTableSurface {assets} {width} {bordered}
		><slot /></ClassicTableSurface>
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
