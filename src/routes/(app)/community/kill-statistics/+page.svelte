<script lang="ts">
	import { page } from '$app/stores';

	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import LabeledForm from '$lib/components/ui/LabeledForm.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;
	$: classic = $page.data.selectedTheme === 'classic';
	$: parameters = new URL(
		themePreviewHref($page.url, '/community/kill-statistics'),
		$page.url,
	).searchParams;
	const timestamp = (value: number) =>
		new Date(value * 1000)
			.toISOString()
			.replace('T', ' ')
			.replace('.000Z', ' UTC');
</script>

<div class="kill-statistics-page">
	{#if !classic}<h2 class="h2">World Selection</h2>{/if}
	<PagePanel title="World Selection" variant="plain" spacing="section">
		<LabeledForm
			action="/community/kill-statistics"
			label="World Name:"
			fieldId="kill-world"
			{parameters}>
			<select class="select" id="kill-world" name="world">
				{#if !data.selected}<option value="" selected>(choose world)</option
					>{/if}
				<option value={data.world} selected={data.selected}
					>{data.world}</option>
			</select>
		</LabeledForm>
	</PagePanel>
	{#if data.statistics}
		{#if !classic}<h2 class="h2">Kill Statistics</h2>{/if}
		<PagePanel title="Kill Statistics" variant="list" surface>
			<CatalogTable>
				<table
					class="classic-data-table classic-data-table--grid classic-data-table--grouped classic-data-table--numeric kill-statistics-table"
					class:table={!classic}
					aria-label="Kill Statistics">
					<colgroup
						><col class="kill-statistics-table__race" /><col
							span="4" /></colgroup>
					<thead>
						<tr
							><th aria-label="Race group"></th><th scope="colgroup" colspan="2"
								>Last Day</th
							><th scope="colgroup" colspan="2">Last Week</th></tr>
						<tr
							><th scope="col">Race</th><th scope="col">Killed Players</th><th
								scope="col">Killed by Players</th
							><th scope="col">Killed Players</th><th scope="col"
								>Killed by Players</th
							></tr>
					</thead>
					<tbody>
						{#each data.statistics.rows as row (row.race)}
							<tr
								><td>{row.race}</td><td>{row.dayPlayers}</td><td
									>{row.dayMonsters}</td
								><td>{row.weekPlayers}</td><td>{row.weekMonsters}</td></tr>
						{:else}<tr
								><td colspan="5"
									>{data.statistics.coverage.updated
										? 'No kills were recorded during this period.'
										: 'No kill statistics have been collected yet.'}</td
								></tr
							>{/each}
					</tbody>
				</table>
			</CatalogTable>
		</PagePanel>
		<div class="page-intro kill-statistics-page__coverage">
			<p>
				Statistics cover the last 24 hours and seven days, through {timestamp(
					data.statistics.through,
				)}.
			</p>
			{#if data.statistics.coverage.updated}
				<p>Last update: {timestamp(data.statistics.coverage.updated)}.</p>
				{#if data.statistics.coverage.partial}<p>
						The recorded history does not cover the entire period. Collection
						started on {timestamp(
							data.statistics.coverage.started ??
								data.statistics.coverage.updated,
						)}; totals include only recorded events.
					</p>{/if}
				{#if data.statistics.coverage.stale}<p>
						The statistics have not received a recent update.
					</p>{/if}
			{:else}<p>
					The server has not published any collected events yet. Totals will
					appear after collection starts.
				</p>{/if}
		</div>
	{/if}
</div>

<style>
	.kill-statistics-page {
		width: 100%;
		min-width: 0;
	}
	.kill-statistics-table {
		width: 100%;
		min-width: 650px;
	}
	.kill-statistics-table th {
		text-align: center;
		white-space: nowrap;
	}
	.kill-statistics-table td {
		text-align: right;
	}
	.kill-statistics-table td:first-child {
		text-align: left;
	}
	.kill-statistics-page__coverage p {
		margin: 0 0 10px;
	}
</style>
