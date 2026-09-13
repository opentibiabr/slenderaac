<script lang="ts">
	import { page } from '$app/stores';

	import TableColumns from '$lib/components/ui/TableColumns.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
	const number = new Intl.NumberFormat('en-US');
</script>

<svelte:head><title>{data.title}</title></svelte:head>
<p class="page-intro">
	These are the total experience points required to reach each level. You can
	also check your progress towards the next level in the experience bar in your
	client's skill window.
</p>
<TableColumns title={data.title} columns={data.columns.length} let:column>
	<table
		class="classic-data-table classic-data-table--compact classic-data-table--numeric"
		class:table={$page.data.selectedTheme !== 'classic'}
		aria-label={`Experience for levels ${data.columns[column][0].level} to ${data.columns[column].at(-1)?.level}`}>
		<thead
			><tr><th scope="col">Level</th><th scope="col">Experience</th></tr
			></thead>
		<tbody
			>{#each data.columns[column] as row}<tr
					><td>{number.format(row.level)}</td><td
						>{number.format(BigInt(row.experience))}</td
					></tr
				>{/each}</tbody>
	</table>
</TableColumns>
