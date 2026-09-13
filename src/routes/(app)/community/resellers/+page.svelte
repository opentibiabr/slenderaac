<script lang="ts">
	import { page } from '$app/stores';

	import AutoSelectForm from '$lib/components/ui/AutoSelectForm.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import PropertyTable from '$lib/components/ui/PropertyTable.svelte';
	import { resellerProperties } from '$lib/directories';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;
	$: parameters = new URL(
		themePreviewHref($page.url, '/community/resellers'),
		$page.url,
	).searchParams;
	$: classic = $page.data.selectedTheme === 'classic';
</script>

<div class="resellers-page">
	<div class="page-prose resellers-page__intro">
		<p>
			Premium services and coins for {$page.data.serverName} are available from the
			<a href={themePreviewHref($page.url, '/shop')}>webshop</a>. The resellers
			listed here offer additional ways to purchase the services they advertise.
		</p>
		<p>
			Select your country to see the partners registered by the server team.
			Each reseller handles its own orders and payments. For questions about a
			purchase made through a reseller, contact that partner using the details
			below.
		</p>
	</div>
	{#if !classic}<h2 class="h2">Select Your Country</h2>{/if}
	<PagePanel title="Select Your Country" variant="details">
		<AutoSelectForm
			action="/community/resellers"
			name="country"
			label="Select Your Country:"
			selected={data.country}
			choices={data.countries}
			{parameters} />
	</PagePanel>
	{#if data.country}
		{#if !classic}<h2 class="h2">Resellers</h2>{/if}
		<PagePanel title="Resellers" variant="details">
			{#each data.entries as entry}<div class="resellers-page__entry">
					<PropertyTable title={entry.name} rows={resellerProperties(entry)} />
				</div>
			{:else}<p class="resellers-page__empty">
					No resellers are currently listed for this country.
				</p>{/each}
		</PagePanel>
	{:else if !data.countries.length}<p class="page-intro">
			No resellers are currently listed. You can purchase server services
			through the <a href={themePreviewHref($page.url, '/shop')}>webshop</a>.
		</p>{/if}
</div>

<style>
	.resellers-page {
		width: 100%;
		min-width: 0;
	}
	:global(.theme-classic) .resellers-page__intro {
		margin: 0 0 30px;
	}
	.resellers-page__intro p,
	:global(.theme-classic) .resellers-page__intro p {
		margin: 0 0 15px;
	}
	.resellers-page__entry {
		margin-bottom: 9px;
	}
	.resellers-page__entry:last-child {
		margin-bottom: 0;
	}
	.resellers-page__empty {
		margin: 0;
		padding: 5px;
	}
</style>
