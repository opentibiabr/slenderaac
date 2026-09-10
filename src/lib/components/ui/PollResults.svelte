<script lang="ts">
	import { page } from '$app/stores';

	import type { pollResults } from '$lib/polls';
	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';

	export let results: ReturnType<typeof pollResults>;
	export let choice: string | null = null;
	$: classic = $page.data.selectedTheme === 'classic';
</script>

{#if !classic}<h2 class="h2">Poll Results</h2>{/if}
<PagePanel title="Poll Results" variant="list" surface>
	<CatalogTable
		><table
			class="classic-data-table classic-data-table--grid"
			class:table={!classic}
			aria-label="Poll results">
			<thead
				><tr
					><th scope="col">Option</th><th
						scope="col"
						class="classic-data-cell--numeric">Votes</th
					><th scope="col" class="classic-data-cell--numeric">Share</th></tr
				></thead>
			<tbody
				>{#each results.options as option}<tr
						><td
							>{option.label}{#if option.id === choice}
								<strong>(Your vote)</strong>{/if}<meter
								aria-label={option.label}
								min="0"
								max="100"
								value={option.percent}>{option.percent.toFixed(1)}%</meter
							></td
						><td class="classic-data-cell--numeric"
							>{option.count.toLocaleString('en-US')}</td
						><td class="classic-data-cell--numeric"
							>{option.percent.toFixed(1)}%</td
						></tr
					>{/each}</tbody>
			<tfoot
				><tr
					><th scope="row">Total</th><td class="classic-data-cell--numeric"
						>{results.total.toLocaleString('en-US')}</td
					><td></td></tr
				></tfoot>
		</table></CatalogTable>
</PagePanel>

<style>
	meter {
		display: block;
		width: 100%;
		min-width: 100px;
		height: 12px;
		margin: 3px 0;
	}
	td:first-child {
		width: 70%;
		overflow-wrap: anywhere;
	}
</style>
