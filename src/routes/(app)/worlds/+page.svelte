<script lang="ts">
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import CatalogDetails from '$lib/components/ui/CatalogDetails.svelte';
	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import CharacterSearch from '$lib/components/ui/CharacterSearch.svelte';
	import LabeledForm from '$lib/components/ui/LabeledForm.svelte';
	import OnlinePlayers from '$lib/components/ui/OnlinePlayers.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import TableSurface from '$lib/themes/classic/TableSurface.svelte';
	import { themePreviewHref } from '$lib/themes/preview';
	import { worldHref, worldPvpTypes } from '$lib/worlds';

	import type { PageData } from './$types';

	export let data: PageData;
	$: classic = $page.data.selectedTheme === 'classic';
	$: world = data.world;
	$: pvp = world.pvpType ? worldPvpTypes[world.pvpType] : 'Not specified';
	$: preview = new URL(themePreviewHref($page.url, '/worlds'), $page.url)
		.searchParams;
	$: record =
		data.onlineRecord === null
			? 'Not recorded'
			: `${data.onlineRecord.toLocaleString('en-US')} players`;
	$: illustrations = [
		{
			key: `worldLocation-${world.location?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
			alt: `Server location: ${world.location ?? ''}`,
		},
		{ key: `worldPvp-${world.pvpType}`, alt: `Server PvP type: ${pvp}` },
	].flatMap(({ key, alt }) =>
		$page.data.themeAssets?.[key]
			? [{ src: $page.data.themeAssets[key], alt }]
			: [],
	);
	$: details = [
		['Status:', data.online ? 'Online' : 'Offline'],
		['Players Online:', data.online ? String(data.onlineCount) : '—'],
		['Online Record:', record],
		...(world.location ? [['Location:', world.location]] : []),
		['PvP Type:', pvp],
		...(world.maxPlayers !== undefined
			? [
					[
						'Player Limit:',
						world.maxPlayers === 0 ? 'Unlimited' : String(world.maxPlayers),
					],
				]
			: []),
	];
</script>

<div class="world-page">
	{#if data.selected}
		{#if !classic}<h3 class="h3">World Selection</h3>{/if}
		<PagePanel title="World Selection" variant="plain">
			<LabeledForm
				action="/worlds"
				label="World Name:"
				fieldId="world-name"
				parameters={preview}>
				<select id="world-name" name="world" class:select={!classic}
					><option value={world.name} selected>{world.name}</option></select>
			</LabeledForm>
		</PagePanel>
		<CatalogDetails
			title="World Information"
			rows={details}
			variant="plain"
			{illustrations} />
		<OnlinePlayers
			serverOnline={data.online}
			characters={data.characters}
			sort={data.sort}
			order={data.order} />
		{#if !classic}<h3 class="h3">Search Character</h3>{/if}
		<CharacterSearch variant="plain" compact={false} />
		<div class="world-page__back"><Button href={worldHref()}>Back</Button></div>
	{:else}
		{#if !classic}<h3 class="h3">Game World Overview</h3>{/if}
		<PagePanel title="Game World Overview" variant="stack">
			<div class="world-page__overview">
				<TableSurface assets={$page.data.themeAssets} width="100%">
					<table
						class="classic-data-table classic-data-table--grid"
						class:table={!classic}>
						<tbody
							><tr
								><td><strong>Overall Maximum:</strong> &nbsp; {record}</td></tr
							></tbody>
					</table>
				</TableSurface>
				<TableSurface assets={$page.data.themeAssets} width="100%">
					<table
						class="classic-data-table classic-data-table--grid"
						class:table={!classic}>
						<tbody><tr><th scope="col">Game Worlds</th></tr></tbody>
					</table>
				</TableSurface>
				<TableSurface assets={$page.data.themeAssets} width="100%">
					<CatalogTable>
						<table
							class="classic-data-table classic-data-table--grid"
							class:table={!classic}
							aria-label="Game Worlds">
							<thead
								><tr
									><th scope="col">World</th><th scope="col">Online</th><th
										scope="col">Location</th
									><th scope="col">PvP Type</th><th scope="col"
										>Additional Information</th
									></tr
								></thead>
							<tbody
								><tr
									><td
										><a
											href={themePreviewHref($page.url, worldHref(world.name))}
											>{world.name}</a
										></td
									><td>{data.online ? data.onlineCount : 'Offline'}</td><td
										>{world.location ?? 'Not specified'}</td
									><td>{pvp}</td><td
										>{world.maxPlayers === undefined
											? ''
											: world.maxPlayers === 0
												? 'Unlimited players'
												: `Up to ${world.maxPlayers} players`}</td
									></tr
								></tbody>
						</table>
					</CatalogTable>
				</TableSurface>
			</div>
		</PagePanel>
	{/if}
</div>

<style>
	.world-page {
		width: 100%;
	}
	.world-page__overview {
		display: grid;
		gap: 9px;
	}
	.world-page__back {
		display: flex;
		justify-content: center;
		margin-top: 15px;
	}
</style>
