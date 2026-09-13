<script lang="ts">
	import { page } from '$app/stores';

	import ClassicTableFrame from '$lib/themes/classic/TableFrame.svelte';

	export let assets: Record<string, string | undefined> | null | undefined;
	// Sprite calibration dimensions apply only to the Classic frame.
	export let minWidth = 0;
	export let minHeight = 0;
</script>

{#if $page.data.selectedTheme === 'classic'}
	<ClassicTableFrame {assets} {minWidth} {minHeight}>
		<svelte:fragment slot="caption"><slot name="caption" /></svelte:fragment>
		<slot />
	</ClassicTableFrame>
{:else}
	<section
		class="news-table-frame card overflow-hidden border border-surface-500">
		<header class="variant-filled-secondary px-4 py-2 font-semibold">
			<slot name="caption" />
		</header>
		<div class="p-3"><slot /></div>
	</section>
{/if}

<style>
	.news-table-frame {
		width: 100%;
		min-width: 0;
	}
</style>
