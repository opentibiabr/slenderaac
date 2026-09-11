<script lang="ts">
	import { page } from '$app/stores';

	import CatalogDetails from '$lib/components/ui/CatalogDetails.svelte';
	import CharacterSearch from '$lib/components/ui/CharacterSearch.svelte';
	import CharactersTable from '$lib/components/ui/CharactersTable.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';

	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ characters, sort, order } = data);
	$: details = [
		['Status:', data.serverOnline ? 'Online' : 'Offline'],
		['Players Online:', data.serverOnline ? String(characters.length) : '—'],
	];
</script>

<CatalogDetails title="World Information" rows={details} />
{#if !data.serverOnline}
	<PagePanel title="Players Online">
		<p>The server is offline. The online player list is unavailable.</p>
	</PagePanel>
{:else if $page.data.selectedTheme === 'classic'}
	<CharactersTable {characters} {sort} {order} title="Players Online" />
{:else}
	<div class="flex flex-col gap-2">
		<CharactersTable {characters} {sort} {order} />
	</div>
{/if}

{#if $page.data.selectedTheme === 'classic'}<CharacterSearch />{/if}
