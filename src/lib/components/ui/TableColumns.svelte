<script lang="ts">
	import { page } from '$app/stores';

	import TableFrame from '$lib/components/news/TableFrame.svelte';
	import TableSurface from '$lib/components/news/TableSurface.svelte';

	export let title: string;
	export let columns: number;
</script>

<section class="table-columns">
	<TableFrame assets={$page.data.themeAssets}>
		<svelte:fragment slot="caption">{title}</svelte:fragment>
		<div class="table-columns__body">
			<table class="table-columns__layout" role="presentation">
				<tbody
					><tr>
						{#each Array(columns) as _, column}<td
								><div class="table-columns__column">
									<TableSurface
										assets={$page.data.themeAssets}
										width="100%"
										additional><slot {column} /></TableSurface>
								</div></td
							>{/each}
					</tr></tbody>
			</table>
		</div>
	</TableFrame>
</section>

<style>
	.table-columns {
		container-type: inline-size;
		width: 100%;
		min-width: 0;
	}
	.table-columns__layout {
		width: 100%;
		border-collapse: separate;
		border-spacing: 2px;
	}
	.table-columns__layout > tbody > tr > td {
		min-width: 0;
		padding: 1px;
		vertical-align: top;
	}
	.table-columns__column {
		margin: 0 5px 5px 0;
	}
	.table-columns__layout > tbody > tr > td:last-child .table-columns__column {
		margin-right: 10px;
	}
	:global(.theme-classic) .table-columns {
		width: calc(100% + 2px);
	}
	:global(.theme-classic) .table-columns__body {
		margin: 5px -3px 0 3px;
	}
	@container (max-width: 720px) {
		.table-columns__layout > tbody > tr {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.table-columns__column {
			margin-right: 5px !important;
		}
	}
	@container (max-width: 480px) {
		.table-columns__layout > tbody > tr {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
