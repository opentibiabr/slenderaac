<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { page } from '$app/stores';

	import type { Pagination } from '$lib/pagination';
	import type { Player, PlayerWithRank } from '$lib/players';
	import type { Order, Sort } from '$lib/sorting';
	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import PageNavigation from '$lib/components/ui/PageNavigation.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import PanelUpdatedAt from '$lib/components/ui/PanelUpdatedAt.svelte';
	import { highscoreCategories } from '$lib/highscores';
	import { playerOnline } from '$lib/online-status';
	import { vocationString } from '$lib/players';
	import { sortHref } from '$lib/sorting';
	import { serverAvailability } from '$lib/stores/online-status';
	import { themePreviewHref } from '$lib/themes/preview';

	export let characters: (Player | PlayerWithRank)[];
	export let ranked = false;
	export let skill: string | null = null;
	export let sort: Sort | null = null;
	export let order: Order = 'asc';
	export let title = 'Characters';
	export let worldName: string | undefined = undefined;
	export let updatedAt: Date | undefined = undefined;
	export let pagination: Pagination | undefined = undefined;
	$: skillLabel =
		highscoreCategories.find((category) => category.value === skill)?.label ??
		skill;
	const dispatch = createEventDispatcher();
</script>

<div class="classic-native-content">
	<PagePanel {title} surface variant={pagination ? 'paged' : 'native'}>
		<svelte:fragment slot="caption"
			>{title}{#if updatedAt}<PanelUpdatedAt
					date={updatedAt} />{/if}</svelte:fragment>
		<svelte:fragment slot="before-surface"
			>{#if pagination}<PageNavigation
					{...pagination}
					label="Highscores pages (top)" />{/if}</svelte:fragment>
		<CatalogTable
			><table
				class="classic-data-table"
				class:classic-data-table--grid={ranked}
				class:character-list--ranked={ranked}>
				<thead
					><tr>
						{#if ranked}<th>Rank</th>{/if}
						<th class:character-list__name={ranked}
							>{#if sort}<a href={sortHref($page.url, 'name', sort, order)}
									>Name</a
								>{:else}Name{/if}</th>
						<th
							>{#if sort}<a href={sortHref($page.url, 'vocation', sort, order)}
									>Vocation</a
								>{:else}Vocation{/if}</th>
						{#if ranked && worldName}<th>World</th>{/if}
						<th class:classic-data-cell--numeric={ranked}
							>{#if sort}<a href={sortHref($page.url, 'level', sort, order)}
									>Level</a
								>{:else}Level{/if}</th>
						{#if skill}<th class:classic-data-cell--numeric={ranked}
								>{ranked ? 'Points' : skillLabel}</th
							>{/if}
						{#if !ranked}<th>Status</th>{/if}
					</tr></thead>
				<tbody>
					{#each characters as character}
						{@const online = playerOnline(
							character.online,
							$serverAvailability,
						)}
						<tr>
							{#if ranked}<td>{'rank' in character ? character.rank : ''}</td
								>{/if}
							<td
								><a
									href={themePreviewHref(
										$page.url,
										'/characters/' + encodeURIComponent(character.name),
									)}
									on:click={() => dispatch('selected')}>{character.name}</a
								></td>
							<td>{vocationString(character.vocation)}</td>
							{#if ranked && worldName}<td>{worldName}</td>{/if}
							<td class:classic-data-cell--numeric={ranked}
								>{character.level}</td>
							{#if skill}<td class:classic-data-cell--numeric={ranked}
									>{'skill' in character ? character.skill : ''}</td
								>{/if}
							{#if !ranked}<td
									>{online === null
										? 'Unavailable'
										: online
											? 'online'
											: 'offline'}</td
								>{/if}
						</tr>
					{:else}<tr
							><td colspan={4 + Number(ranked && !!worldName) + Number(!!skill)}
								>No characters found.</td
							></tr
						>{/each}
				</tbody>
			</table></CatalogTable>
		<svelte:fragment slot="after-surface"
			>{#if pagination}<PageNavigation
					{...pagination}
					position="bottom"
					label="Highscores pages (bottom)" />{/if}</svelte:fragment>
	</PagePanel>
</div>

<style>
	.character-list__name {
		width: 90%;
	}
	.character-list--ranked :is(th, td) {
		white-space: nowrap;
	}
</style>
