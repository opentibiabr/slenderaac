<script lang="ts">
	import { page } from '$app/stores';

	import CatalogTable from './CatalogTable.svelte';
	import PagePanel from './PagePanel.svelte';

	export let title: string;
	export let rows: readonly (readonly string[])[];
	export let variant: 'form' | 'plain' = 'form';
	export let illustrations: { src: string; alt: string }[] = [];
	export let fitLabels = false;
	export let spacing: 'default' | 'related' | 'section' = 'default';
	$: classic = $page.data.selectedTheme === 'classic';
</script>

{#if !classic}<h3 class="h3">{title}</h3>{/if}
<PagePanel {title} surface={variant !== 'plain'} {variant} {spacing}>
	<CatalogTable>
		<table
			aria-label={title}
			class="classic-data-table classic-data-table--grid classic-data-table--properties"
			class:catalog-details--plain={variant === 'plain'}
			class:catalog-details--illustrated={illustrations.length > 0}
			class:catalog-details--fit-labels={fitLabels}
			class:table={!classic}>
			<tbody
				>{#each rows as [label, value]}<tr
						><th scope="row">{label}</th><td>{value}</td></tr
					>{/each}</tbody>
		</table>
	</CatalogTable>
	<svelte:fragment slot="decoration"
		>{#if illustrations.length}<div class="catalog-details__illustrations">
				{#each illustrations as illustration}<img
						src={illustration.src}
						alt={illustration.alt}
						width="48"
						height="48" />{/each}
			</div>{/if}</svelte:fragment>
</PagePanel>

<style>
	.catalog-details__illustrations {
		position: absolute;
		z-index: 2;
		top: 41px;
		right: 11px;
		display: grid;
		gap: 12px;
	}
	.catalog-details__illustrations img {
		width: 48px;
		height: 48px;
	}
	:global(.theme-classic .classic-native-content)
		.catalog-details--plain.catalog-details--illustrated
		td {
		padding-right: 66px;
	}
	:global(.theme-classic .classic-native-content) .catalog-details--plain {
		border: 0;
		border-collapse: separate;
		border-spacing: 2px;
	}
	:global(.theme-classic .classic-native-content)
		.catalog-details--plain
		:is(th, td) {
		border: 0;
		padding: 1px;
		line-height: 16px;
		background: transparent;
	}
	:global(.theme-classic .classic-native-content)
		.catalog-details--plain
		tbody
		tr:nth-child(n) {
		background: transparent;
	}
	:global(.theme-classic .classic-native-content)
		.catalog-details--plain
		th[scope='row'] {
		box-sizing: content-box;
		width: 200px;
		padding-right: 10px;
		font-weight: bold;
	}
	:global(.theme-classic .classic-native-content)
		.catalog-details--plain.catalog-details--fit-labels
		th[scope='row'] {
		width: 1%;
		white-space: nowrap;
	}
	@media (max-width: 767px) {
		:global(.theme-classic .classic-native-content)
			.catalog-details--plain.catalog-details--fit-labels
			th[scope='row'] {
			width: 35%;
			white-space: normal;
		}
		.catalog-details__illustrations {
			display: none;
		}
		:global(.theme-classic .classic-native-content)
			.catalog-details--plain.catalog-details--illustrated
			td {
			padding-right: 1px;
		}
		:global(.theme-classic .classic-native-content)
			.catalog-details--plain
			th[scope='row'] {
			width: 35%;
		}
	}
</style>
