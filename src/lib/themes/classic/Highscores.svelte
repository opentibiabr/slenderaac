<script lang="ts">
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import CharactersTable from '$lib/components/ui/CharactersTable.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { highscoreCategories } from '$lib/highscores';
	import { vocationFilters as vocations } from '$lib/players';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from '../../../routes/(app)/highscores/$types';

	export let data: PageData;
	$: parameters = new URL(themePreviewHref($page.url, '/highscores'), $page.url)
		.searchParams;
	$: lastPage = Math.max(1, Math.ceil(data.count / data.limit));
	function pageHref(number: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', String(number));
		return themePreviewHref($page.url, url.pathname + url.search);
	}
</script>

<PagePanel title="Highscores Filter">
	<form method="get" class="classic-filter-grid">
		{#each Array.from(parameters) as [name, value]}<input
				type="hidden"
				{name}
				{value} />{/each}
		<label for="ranking-vocation">Vocation:</label>
		<select id="ranking-vocation" name="vocation">
			{#each vocations as vocation}<option
					value={vocation}
					selected={data.vocation === vocation}
					>{vocation === 'all'
						? '(all)'
						: vocation[0].toUpperCase() + vocation.slice(1)}</option
				>{/each}
		</select>
		<label for="ranking-category">Category:</label>
		<select id="ranking-category" name="skill"
			>{#each highscoreCategories as { value, label }}<option
					{value}
					selected={data.skill === value}>{label}</option
				>{/each}</select>
		<label for="ranking-limit">Results per page:</label>
		<select id="ranking-limit" name="limit"
			>{#each [50, 100, 200] as amount}<option
					value={amount}
					selected={data.limit === amount}>{amount}</option
				>{/each}</select>
		<div class="classic-filter-submit">
			<Button type="submit">Submit</Button>
		</div>
	</form>
</PagePanel>
<CharactersTable
	characters={data.characters}
	skill={data.skill}
	ranked
	title="Highscores" />
<nav class="classic-pagination" aria-label="Highscores pages">
	<span
		>{#if data.page > 1}<a href={pageHref(1)}>First</a> ·
			<a href={pageHref(data.page - 1)}>Previous</a>{/if}</span>
	<span>Page {data.page} of {lastPage}</span>
	<span
		>{#if data.page < lastPage}<a href={pageHref(data.page + 1)}>Next</a> ·
			<a href={pageHref(lastPage)}>Last</a>{/if}</span>
</nav>
