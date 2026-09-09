<script lang="ts">
	import { page } from '$app/stores';

	import CharactersTable from '$lib/components/ui/CharactersTable.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import TableFilter from '$lib/components/ui/TableFilter.svelte';
	import { highscoreCategories } from '$lib/highscores';
	import { vocationFilters as vocations } from '$lib/players';
	import { themePreviewHref } from '$lib/themes/preview';
	import { worldHref, worldPvpTypes } from '$lib/worlds';

	import type { PageData } from '../../../routes/(app)/highscores/$types';

	export let data: PageData;
	$: parameters = new URL(themePreviewHref($page.url, '/highscores'), $page.url)
		.searchParams;
	function pageHref(number: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', String(number));
		return themePreviewHref($page.url, url.pathname + url.search);
	}
</script>

<PagePanel title="Highscores Filter" variant="plain" compact>
	<TableFilter action="/highscores" {parameters}>
		<tr
			><td>World:</td><td
				><a href={themePreviewHref($page.url, worldHref(data.world.name))}
					>{data.world.name}</a
				></td
			><td><label for="ranking-limit">Results per page:</label></td><td>
				<select id="ranking-limit" name="limit"
					>{#each [50, 100, 200] as amount}<option
							value={amount}
							selected={data.limit === amount}>{amount}</option
						>{/each}</select>
			</td></tr>
		<tr
			><td><label for="ranking-vocation">Vocation:</label></td><td>
				<select id="ranking-vocation" name="vocation"
					>{#each vocations as vocation}<option
							value={vocation}
							selected={data.vocation === vocation}
							>{vocation === 'all'
								? '(all)'
								: vocation[0].toUpperCase() + vocation.slice(1)}</option
						>{/each}</select>
			</td><td><label for="ranking-category">Category:</label></td><td>
				<select id="ranking-category" name="skill"
					>{#each highscoreCategories as { value, label }}<option
							{value}
							selected={data.skill === value}>{label}</option
						>{/each}</select>
			</td></tr>
		{#if data.world.pvpType}<tr
				><td>World Type:</td><td colspan="3"
					>{worldPvpTypes[data.world.pvpType]}</td
				></tr
			>{/if}
	</TableFilter>
</PagePanel>
<p class="page-intro" style="margin: 12px 0">
	Highscores show saved character skills. Temporary and equipment bonuses are
	not included.
</p>
<CharactersTable
	characters={data.characters}
	skill={data.skill}
	ranked
	worldName={data.world.name}
	updatedAt={data.updatedAt}
	pagination={{
		page: data.page,
		limit: data.limit,
		count: data.count,
		href: pageHref,
	}}
	title="Highscores" />
