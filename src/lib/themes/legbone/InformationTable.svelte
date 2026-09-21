<script lang="ts">
	import PagePanel from '$lib/components/ui/PagePanel.svelte';

	export let title: string;
	export let compact = false;
</script>

<section class="information-table" aria-label={title}>
	<h2 class="h4 mb-2">{title}</h2>
	<PagePanel {title} surface>
		<div class="table-container">
			<table
				class="TableContent table"
				class:CompactTable={compact}
				class:ContactTable={!compact}
				aria-label={title}>
				<slot />
			</table>
		</div>
	</PagePanel>
</section>

<style>
	.information-table {
		display: block;
		width: 100%;
		min-width: 0;
		margin: 1rem 0;
	}
	.table-container {
		width: 100%;
		overflow-x: auto;
	}
	table {
		width: 100%;
	}
	table :global(th),
	table :global(td) {
		white-space: normal;
		overflow-wrap: anywhere;
	}
</style>
