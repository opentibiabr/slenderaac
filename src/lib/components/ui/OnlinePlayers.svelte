<script lang="ts">
	import { page } from '$app/stores';

	import { type Player, vocationString } from '$lib/players';
	import { type Order, type Sort, sortHref } from '$lib/sorting';
	import { themePreviewHref } from '$lib/themes/preview';

	import AlphabetNavigation from './AlphabetNavigation.svelte';
	import CatalogTable from './CatalogTable.svelte';
	import PagePanel from './PagePanel.svelte';

	export let characters: Player[];
	export let sort: Sort;
	export let order: Order;
	const columns = [
		{ key: 'name', label: 'Name' },
		{ key: 'level', label: 'Level' },
		{ key: 'vocation', label: 'Vocation' },
	] as const;
	$: classic = $page.data.selectedTheme === 'classic';
	$: nextOrder = order === 'asc' ? 'desc' : 'asc';
	$: arrow =
		$page.data.themeAssets?.[
			nextOrder === 'asc' ? 'sortAscending' : 'sortDescending'
		];
	let initials = new Map<string, number>();
	$: {
		initials = new Map();
		for (const character of characters) {
			const initial = character.name[0]?.toUpperCase();
			if (initial && !initials.has(initial))
				initials.set(initial, character.id);
		}
	}
	$: anchors = new Map(
		[...initials.keys()].map((letter) => [letter, `#online-${letter}`]),
	);
</script>

<section class="online-players" aria-label="Players Online">
	{#if !classic}<h3 class="h3">Players Online</h3>{/if}
	<div
		class="online-players__responsive-alphabet"
		class:online-players__responsive-alphabet--classic={classic}>
		<AlphabetNavigation {anchors} />
	</div>
	<PagePanel title="Players Online" variant="flush">
		<svelte:fragment slot="caption">
			Players Online
			<span class="online-players__alphabet"
				><AlphabetNavigation {anchors} /></span>
		</svelte:fragment>
		<CatalogTable>
			<table
				class="classic-data-table classic-data-table--grid online-players__table"
				class:table={!classic}
				aria-label="Players Online">
				<thead
					><tr
						>{#each columns as column}
							<th
								scope="col"
								aria-sort={sort === column.key
									? order === 'asc'
										? 'ascending'
										: 'descending'
									: 'none'}>
								{column.label}
								<small
									>[<a
										href={sortHref(
											$page.url,
											column.key,
											sort,
											order,
											nextOrder,
										)}
										aria-label={`Sort by ${column.label.toLowerCase()}`}>sort</a
									>]</small>
								<span class="online-players__sort-arrow"
									>{#if sort === column.key}{#if arrow}<img
												src={arrow}
												width="10"
												height="10"
												alt="" />{:else}{order === 'asc'
												? '↓'
												: '↑'}{/if}{/if}</span>
							</th>
						{/each}</tr
					></thead>
				<tbody
					>{#each characters as character}
						<tr
							id={initials.get(character.name[0]?.toUpperCase()) ===
							character.id
								? `online-${character.name[0].toUpperCase()}`
								: undefined}>
							<td
								><a
									href={themePreviewHref(
										$page.url,
										`/characters/${encodeURIComponent(character.name)}`,
									)}>{character.name}</a
								></td>
							<td>{character.level}</td><td
								>{vocationString(character.vocation)}</td>
						</tr>
					{:else}<tr><td colspan="3">There are no players online.</td></tr
						>{/each}</tbody>
			</table>
		</CatalogTable>
	</PagePanel>
</section>

<style>
	.online-players {
		width: 100%;
		margin-bottom: 15px;
	}
	.online-players__alphabet {
		float: right;
		display: inline-flex;
		gap: 4px;
	}
	.online-players__responsive-alphabet {
		margin-bottom: 10px;
	}
	.online-players__responsive-alphabet--classic {
		display: none;
	}
	.online-players__table th:not(:first-child),
	.online-players__table td:not(:first-child) {
		white-space: nowrap;
		width: 1%;
	}
	.online-players__table th:nth-child(2) {
		min-width: 109px;
	}
	.online-players__table th:nth-child(3) {
		min-width: 135px;
	}
	.online-players__table th small {
		margin-left: 5px;
		font-size: 83.333333%;
		font-weight: normal;
	}
	.online-players__sort-arrow {
		display: inline-block;
		width: 10px;
		height: 10px;
		font-size: 10px;
		line-height: 10px;
	}
	.online-players__sort-arrow img {
		display: block;
		width: 10px;
		height: 10px;
	}
	.online-players__table tr {
		scroll-margin-top: 12px;
	}
	:global(.theme-classic) .online-players {
		margin-bottom: 0;
	}
	@media (max-width: 767px) {
		.online-players__responsive-alphabet--classic {
			display: block;
		}
		.online-players__alphabet {
			display: none;
		}
	}
</style>
