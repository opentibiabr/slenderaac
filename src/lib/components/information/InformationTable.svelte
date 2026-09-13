<script lang="ts">
	import { page } from '$app/stores';

	import PagePanel from '$lib/components/ui/PagePanel.svelte';

	export let title: string;
	export let compact = false;
	$: classic = $page.data.selectedTheme === 'classic';
</script>

<section class="information-table" aria-label={title}>
	{#if !classic}<h2 class="h4 mb-2">{title}</h2>{/if}
	<PagePanel {title} surface>
		<div
			class:table-container={!classic}
			class:information-table__contents={classic}>
			<table
				class="TableContent"
				class:CompactTable={compact}
				class:ContactTable={!compact}
				class:table={!classic}
				aria-label={title}>
				<slot />
			</table>
		</div>
	</PagePanel>
</section>

<style>
	.information-table,
	.information-table__contents {
		display: contents;
	}
	:global(.theme-legbone) .information-table {
		display: block;
		width: 100%;
		min-width: 0;
		margin: 1rem 0;
	}
	:global(.theme-legbone) .table-container {
		width: 100%;
		overflow-x: auto;
	}
	:global(.theme-legbone) table {
		width: 100%;
	}
	:global(.theme-legbone) table :global(th),
	:global(.theme-legbone) table :global(td) {
		white-space: normal;
		overflow-wrap: anywhere;
	}
</style>
