<script lang="ts">
	import { slide } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import CharacterSearch from '$lib/components/ui/CharacterSearch.svelte';
	import CharactersTable from '$lib/components/ui/CharactersTable.svelte';
	import SearchQuerier from '$lib/components/ui/SearchQuerier.svelte';

	import type { LayoutData } from './$types';

	export let data: LayoutData;

	let reset: () => void;

	$: results = data.results ?? [];
</script>

{#if $page.data.selectedTheme === 'classic'}
	<slot />
	<CharacterSearch />
	{#if results.length > 0}<CharactersTable characters={results} />{/if}
{:else}
	<div class="flex flex-col items-center gap-2 w-full min-w-0">
		<slot />

		<SearchQuerier label={$_('character-name')} bind:reset />

		{#if results.length > 0}
			<div class="w-full min-w-0" transition:slide>
				<CharactersTable characters={results} on:selected={reset} />
			</div>
		{/if}
	</div>
{/if}
