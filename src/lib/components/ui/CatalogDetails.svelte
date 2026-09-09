<script lang="ts">
	import { page } from '$app/stores';

	import CatalogTable from './CatalogTable.svelte';
	import PagePanel from './PagePanel.svelte';

	export let title: string;
	export let rows: readonly (readonly string[])[];
	$: classic = $page.data.selectedTheme === 'classic';
</script>

{#if !classic}<h3 class="h3">{title}</h3>{/if}
<PagePanel {title} surface variant="form">
	<CatalogTable>
		<table
			aria-label={title}
			class="classic-data-table classic-data-table--grid classic-data-table--properties"
			class:table={!classic}>
			<tbody
				>{#each rows as [label, value]}<tr
						><th scope="row">{label}</th><td>{value}</td></tr
					>{/each}</tbody>
		</table>
	</CatalogTable>
</PagePanel>
