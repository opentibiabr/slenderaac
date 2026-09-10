<script lang="ts">
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import IllustratedDetail from '$lib/components/ui/IllustratedDetail.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { houseHref, houseOrders } from '$lib/houses';
	import TableSurface from '$lib/themes/classic/TableSurface.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;
	$: classic = $page.data.selectedTheme === 'classic';
	$: house = data.house;
	$: preview = new URL(themePreviewHref($page.url, '/houses'), $page.url)
		.searchParams;
	$: resultTitle = `Available ${data.filters.type === 'guildhalls' ? 'Guildhalls' : 'Houses and Flats'} in ${data.filters.town} on ${data.world}`;
	const gold = (amount: number) =>
		`${amount >= 1000 && amount % 1000 === 0 ? `${amount / 1000}k` : amount.toLocaleString('en-US')} gold`;
	const deadline = (time: number) =>
		new Date(time * 1000).toLocaleString('en-GB', { timeZone: 'UTC' }) + ' UTC';
</script>

<div class="houses-page">
	{#if house}
		<IllustratedDetail picture={data.picture} name={house.name}>
			<strong>{house.name}</strong><br />
			{#if house.definition?.bedCapacity !== undefined}
				This {house.definition.guildhall ? 'guildhall' : 'house'} can have up to
				{house.definition.bedCapacity} beds.
			{:else}This house currently contains {house.beds} beds.{/if}
			<p>
				The house has a size of <strong>{house.size} square meters</strong>. Its
				listed rent is <strong>{gold(house.rent)}</strong> on
				<strong>{data.world}</strong>.
			</p>
			{#if house.rented}
				<p>
					The house has been rented{#if house.owner}
						by <a
							href={themePreviewHref(
								$page.url,
								`/characters/${encodeURIComponent(house.owner)}`,
							)}>{house.owner}</a
						>{/if}.
					{#if house.paidUntil}The rent has been paid until <strong
							>{deadline(house.paidUntil)}</strong
						>.{/if}
				</p>
			{:else}
				<p>
					This house is being auctioned.
					{#if house.bid > 0}The current highest bid is <strong
							>{gold(house.bid)}</strong
						>.{:else}No bid has been submitted so far.{/if}
					{#if house.bidEnd}The auction ends on <strong
							>{deadline(house.bidEnd)}</strong
						>.{/if}
				</p>
			{/if}
		</IllustratedDetail>
		<div class="houses-page__detail-actions">
			{#if house.rented}
				<Button
					type="button"
					disabled
					tooltip="Move out using the game client's house controls"
					>Move Out</Button>
				<Button
					type="button"
					disabled
					tooltip="Transfer using the game client's house controls"
					>Transfer</Button>
			{:else}
				<Button
					type="button"
					disabled
					tooltip="Bid using the game client's house controls">Bid</Button>
			{/if}
			<Button href={houseHref($page.url.searchParams)}>Back</Button>
		</div>
		<p class="houses-page__management">
			Bids, transfers and move-outs are managed in the game client.
			<a href={themePreviewHref($page.url, '/guides/manual?section=houses')}
				>House controls</a>
		</p>
	{:else}
		<p class="page-intro page-intro--section">
			Here you can see the list of available houses, flats and guildhalls on {data.world}.
			Select your game world and town. Click on any View button to get more
			information about a house, or adjust the search criteria and start a new
			search. See the
			<a href={themePreviewHref($page.url, '/guides/manual?section=houses')}
				>manual</a> for a detailed description about renting houses.
		</p>
		{#if data.searched}
			{#if !classic}<h2 class="h2">Houses in {data.filters.town}</h2>{/if}
			<PagePanel title={resultTitle} variant="list" surface>
				<CatalogTable>
					<table
						class="classic-data-table classic-data-table--grid houses-page__results"
						class:table={!classic}
						aria-label="Houses">
						<thead
							><tr
								><th scope="col">Name</th><th scope="col">Size</th><th
									scope="col">Rent</th
								><th scope="col">Status</th><th scope="col"
									><span class="sr-only">Details</span></th
								></tr
							></thead>
						<tbody>
							{#each data.houses as entry (entry.id)}
								<tr
									><td>{entry.name}</td><td>{entry.size} sqm</td><td
										>{gold(entry.rent)}</td
									><td
										>{entry.rented
											? 'rented'
											: 'auctioned'}{#if !entry.rented && entry.bid > 0}<br />({gold(
												entry.bid,
											)}){/if}</td
									><td
										><Button href={houseHref($page.url.searchParams, entry.id)}
											>View<span class="sr-only"> {entry.name}</span></Button
										></td
									></tr>
							{:else}<tr
									><td colspan="5">No houses match these search criteria.</td
									></tr
								>{/each}
						</tbody>
					</table>
				</CatalogTable>
			</PagePanel>
		{/if}
		<form action="/houses" method="GET">
			{#each [...preview] as [name, value]}<input
					type="hidden"
					{name}
					{value} />{/each}
			{#if !classic}<h2 class="h2">House Search</h2>{/if}
			<PagePanel title="House Search" variant="stack" compact>
				<div class="houses-page__search">
					<TableSurface assets={$page.data.themeAssets} width="100%">
						<div class="houses-page__world">
							<label for="house-world">World</label><select
								id="house-world"
								name="world"
								class:select={!classic}
								><option value={data.world} selected>{data.world}</option
								></select>
						</div>
					</TableSurface>
					<TableSurface assets={$page.data.themeAssets} width="100%">
						<table
							class="houses-page__filters"
							aria-label="House search criteria">
							<thead
								><tr
									><th id="house-town" scope="col">Town</th><th
										id="house-state"
										scope="col">Status</th
									><th id="house-order" scope="col">Order</th></tr
								></thead>
							<tbody
								><tr>
									<td
										><fieldset aria-labelledby="house-town">
											<legend class="md:sr-only">Town</legend>
											{#each data.towns as town}<label
													><input
														type="radio"
														name="town"
														value={town}
														checked={town === data.filters.town} />
													{town}</label
												>{/each}
										</fieldset></td>
									<td
										><fieldset aria-labelledby="house-state">
											<legend class="md:sr-only">Status</legend>
											{#each [['', 'all states'], ['auctioned', 'auctioned'], ['rented', 'rented']] as [value, label]}<label
													><input
														type="radio"
														name="state"
														{value}
														checked={value === data.filters.state} />
													{label}</label
												>{/each}
										</fieldset>
										<fieldset class="houses-page__type" aria-label="House type">
											<legend class="md:sr-only">House type</legend>
											{#each [['houses', 'houses and flats'], ['guildhalls', 'guildhalls']] as [value, label]}<label
													><input
														type="radio"
														name="type"
														{value}
														checked={value === data.filters.type} />
													{label}</label
												>{/each}
										</fieldset>
									</td>
									<td
										><fieldset aria-labelledby="house-order">
											<legend class="md:sr-only">Order</legend>
											{#each Object.entries(houseOrders) as [value, label]}<label
													><input
														type="radio"
														name="order"
														{value}
														checked={value === data.filters.order} />
													{label}</label
												>{/each}
										</fieldset></td>
								</tr></tbody>
						</table>
					</TableSurface>
				</div>
			</PagePanel>
			<div class="houses-page__actions">
				<Button type="submit">Submit</Button>
			</div>
		</form>
	{/if}
</div>

<style>
	.houses-page {
		width: 100%;
	}
	.houses-page__search {
		display: grid;
		gap: 9px;
	}
	.houses-page__world {
		display: flex;
		align-items: center;
		gap: 50px;
		padding: 2px 5px;
		border: 1px solid #faf0d7;
	}
	.houses-page__world label {
		font-weight: bold;
	}
	.houses-page__world select {
		flex: 1;
		min-width: 0;
	}
	.houses-page__filters {
		width: 100%;
		border-collapse: collapse;
		border: 1px solid #faf0d7;
	}
	.houses-page__filters :is(th, td) {
		padding: 2px 5px;
		text-align: left;
		vertical-align: top;
		border: 1px solid #faf0d7;
	}
	.houses-page__filters th {
		font-weight: bold;
	}
	.houses-page__filters fieldset {
		margin: 0;
		padding: 0;
		border: 0;
	}
	.houses-page__filters label {
		display: block;
		line-height: normal;
		white-space: nowrap;
	}
	.houses-page__filters input {
		margin: 3px 3px 0 5px;
		vertical-align: baseline;
	}
	.houses-page__filters .houses-page__type {
		border-top: 1px solid #fff2db;
		margin-top: 75px;
		padding-top: 5px;
	}
	.houses-page__actions {
		display: flex;
		justify-content: center;
		margin-top: 15px;
	}
	.houses-page__detail-actions {
		display: flex;
		justify-content: space-around;
		flex-wrap: wrap;
		gap: 10px;
		margin: 40px 0 25px;
		padding-bottom: 5px;
	}
	.houses-page__management {
		margin: 15px 0 0;
		font-size: 12px;
	}
	.houses-page__results td:last-child {
		width: 145px;
		text-align: center;
	}
	.houses-page__results :is(td, th):nth-child(1),
	.houses-page__results :is(td, th):nth-child(4) {
		width: 40%;
	}
	.houses-page__results :is(td, th):nth-child(2),
	.houses-page__results :is(td, th):nth-child(3) {
		width: 10%;
	}
	.houses-page__results td {
		white-space: nowrap;
	}
	@media (max-width: 767px) {
		.houses-page__filters,
		.houses-page__filters tbody,
		.houses-page__filters tr,
		.houses-page__filters td {
			display: block;
			width: 100%;
		}
		.houses-page__filters thead {
			display: none;
		}
		.houses-page__filters td {
			padding: 8px;
		}
		.houses-page__filters fieldset {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 4px;
		}
		.houses-page__filters legend {
			font-weight: bold;
			margin-bottom: 6px;
		}
		.houses-page__filters .houses-page__type {
			margin-top: 12px;
		}
		.houses-page__world {
			gap: 12px;
		}
		.houses-page__filters input {
			flex: none;
		}
		.houses-page__filters label {
			display: flex;
			align-items: baseline;
			gap: 2px;
		}
		.houses-page__filters td {
			box-sizing: border-box;
		}
		.houses-page__filters label {
			white-space: normal;
		}
	}
</style>
