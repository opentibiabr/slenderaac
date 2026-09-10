<script lang="ts">
	import { page } from '$app/stores';

	import DirectoryFilters from '$lib/components/ui/DirectoryFilters.svelte';
	import FansiteGroup from '$lib/components/ui/FansiteGroup.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="fansites-page">
	<div class="page-prose fansites-page__intro">
		<p>
			Looking for game information, helpful tools or stories from fellow
			players? The fansites listed here provide resources for the {$page.data
				.serverName} community. Use the filters below to find content and languages
			that interest you.
		</p>
		<p>
			These websites are maintained by independent community members. Each
			website manages its own content and services. Contact its team for
			questions about the information or tools it provides.
		</p>
	</div>
	<DirectoryFilters />
	<FansiteGroup
		promoted
		entries={data.entries.filter((entry) => entry.promoted)} />
	<FansiteGroup
		promoted={false}
		entries={data.entries.filter((entry) => !entry.promoted)} />
</div>

<style>
	:global(.theme-classic) .fansites-page__intro {
		margin: 0;
	}
	:global(.theme-classic) .fansites-page__intro p,
	.fansites-page__intro p {
		margin: 0 0 15px;
	}
	.fansites-page {
		width: 100%;
		min-width: 0;
		overflow-wrap: anywhere;
	}
</style>
