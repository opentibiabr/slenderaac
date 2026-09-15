<script lang="ts">
	import PagePanel from '$lib/components/ui/PagePanel.svelte';

	export let title: string;
	export let compact = false;
</script>

<section class="information-table" aria-label={title}>
	<PagePanel {title} surface>
		<div class="information-table__contents">
			<table
				class="TableContent"
				class:CompactTable={compact}
				class:ContactTable={!compact}
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
</style>
