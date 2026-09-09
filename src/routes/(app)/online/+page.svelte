<script lang="ts">
	import { page } from '$app/stores';

	import CharacterSearch from '$lib/components/ui/CharacterSearch.svelte';
	import CharactersTable from '$lib/components/ui/CharactersTable.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';

	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ characters, sort, order } = data);
</script>

{#if $page.data.selectedTheme === 'classic'}
	<PagePanel title="World Information">
		<table class="classic-data-table classic-data-table--details">
			<tbody
				><tr><td>Players Online:</td><td>{characters.length}</td></tr></tbody>
		</table>
	</PagePanel>
	<CharactersTable {characters} {sort} {order} title="Players Online" />
	<CharacterSearch />
{:else}
	<div class="flex flex-col gap-2">
		<CharactersTable {characters} {sort} {order} />
	</div>
{/if}
