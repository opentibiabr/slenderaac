<script lang="ts">
	import { page } from '$app/stores';

	import { themePreviewHref } from '$lib/themes/preview';

	import Button from './Button.svelte';
	import PagePanel from './PagePanel.svelte';

	$: parameters = new URL(themePreviewHref($page.url, '/characters'), $page.url)
		.searchParams;
</script>

<PagePanel title="Search Character" compact>
	<form method="get" action="/characters" class="classic-character-search">
		{#each Array.from(parameters) as [name, value]}
			<input type="hidden" {name} {value} />
		{/each}
		<label for="character-name">Character Name:</label>
		<input
			id="character-name"
			name="name"
			required
			value={$page.params.name ?? ''}
			autocomplete="off" />
		<Button type="submit">Submit</Button>
	</form>
</PagePanel>

<style>
	.classic-character-search {
		display: flex;
		gap: 5px;
		padding: 5px 5px 5px 0;
		align-items: flex-start;
	}
	.classic-character-search label {
		flex: 0 0 130px;
		min-width: 0;
		padding-right: 10px;
		font-weight: bold;
		white-space: nowrap;
	}
	.classic-character-search > input:not([type='hidden']) {
		flex: 1;
		width: 0;
		min-width: 0;
	}
	@media (max-width: 767px) {
		.classic-character-search {
			flex-wrap: wrap;
		}
		.classic-character-search label {
			flex-basis: 100%;
		}
	}
</style>
