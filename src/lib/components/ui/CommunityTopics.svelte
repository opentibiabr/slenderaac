<script lang="ts">
	import { page } from '$app/stores';

	import { communityFormDate } from '$lib/community-forms';
	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';

	export let title: string;
	export let topics: { id: string; title: string; ends_at: Date | null }[];
	export let href: (id: string) => string;
	export let empty: string;
	export let compact = false;
	export let paged = false;
	$: classic = $page.data.selectedTheme === 'classic';
</script>

{#if !classic}<h2 class="h2">{title}</h2>{/if}
<PagePanel {title} variant={paged ? 'paged' : 'list'} surface {compact}>
	<svelte:fragment slot="before-surface"
		><slot name="before" /></svelte:fragment>
	<CatalogTable
		><table
			class="classic-data-table classic-data-table--grid"
			class:table={!classic}
			aria-label={title}>
			<colgroup><col style="width:70%" /><col style="width:30%" /></colgroup>
			<thead
				><tr
					><th scope="col">Topic</th><th
						scope="col"
						class="classic-data-cell--numeric">End</th
					></tr
				></thead>
			<tbody
				>{#each topics as topic}<tr
						><td><a href={href(topic.id)}>{topic.title}</a></td><td
							class="classic-data-cell--numeric"
							>{communityFormDate(topic.ends_at)}</td
						></tr
					>{:else}<tr><td colspan="2">{empty}</td></tr>{/each}</tbody>
		</table></CatalogTable>
	<svelte:fragment slot="after-surface"><slot name="after" /></svelte:fragment>
</PagePanel>
