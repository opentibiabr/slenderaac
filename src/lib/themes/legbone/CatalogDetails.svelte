<script lang="ts">
	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';

	export let title: string;
	export let rows: readonly (readonly string[])[];
	export let variant: 'form' | 'plain' = 'form';
	export let illustrations: { src: string; alt: string }[] = [];
	export let fitLabels = false;
	export let spacing: 'default' | 'related' | 'section' = 'default';
</script>

<h3 class="h3">{title}</h3>
<PagePanel {title} surface={variant !== 'plain'} {variant} {spacing}>
	<CatalogTable>
		<table
			aria-label={title}
			class="classic-data-table classic-data-table--grid classic-data-table--properties table"
			class:catalog-details--plain={variant === 'plain'}
			class:catalog-details--illustrated={illustrations.length > 0}
			class:catalog-details--fit-labels={fitLabels}>
			<tbody>
				{#each rows as [label, value]}
					<tr><th scope="row">{label}</th><td>{value}</td></tr>
				{/each}
			</tbody>
		</table>
	</CatalogTable>
	<svelte:fragment slot="decoration">
		{#if illustrations.length}
			<div class="catalog-details__illustrations">
				{#each illustrations as illustration}
					<img
						src={illustration.src}
						alt={illustration.alt}
						width="48"
						height="48" />
				{/each}
			</div>
		{/if}
	</svelte:fragment>
</PagePanel>

<style>
	.catalog-details__illustrations {
		display: grid;
		gap: 0.75rem;
	}
	.catalog-details__illustrations img {
		width: 48px;
		height: 48px;
	}
</style>
