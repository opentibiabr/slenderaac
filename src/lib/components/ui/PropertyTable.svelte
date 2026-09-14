<script lang="ts">
	import { page } from '$app/stores';

	import TableSurface from '$lib/components/news/TableSurface.svelte';
	import { getThemeContext } from '$lib/themes/context';

	export let title: string;
	export let rows: {
		label: string;
		value: string;
		href?: string;
		external?: boolean;
		strong?: boolean;
	}[];
	const theme = getThemeContext();
	$: classic = $theme.profile.presentation.pageSurface === 'ornate';
</script>

<TableSurface assets={$page.data.themeAssets} width="100%">
	<table
		class="classic-data-table property-table"
		class:table={!classic}
		aria-label={title}>
		<tbody
			>{#each rows as row}<tr>
					<th scope="row">{row.label}</th>
					<td
						>{#if row.href}<a
								href={row.href}
								target={row.external ? '_blank' : undefined}
								rel={row.external ? 'noopener noreferrer' : undefined}
								>{row.value}</a
							>{:else if row.strong}<strong>{row.value}</strong
							>{:else}{row.value}{/if}</td>
				</tr>{/each}</tbody>
	</table>
</TableSurface>

<style>
	.property-table {
		width: 100%;
	}
	.property-table td {
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}
	:global(.layout-surface-ornate .classic-native-content)
		.property-table
		tr:nth-child(n) {
		background: transparent;
	}
	:global(.layout-surface-ornate .classic-native-content) .property-table th {
		box-sizing: content-box;
		width: 150px;
	}
	@media (max-width: 767px) {
		:global(.layout-surface-ornate .classic-native-content) .property-table th {
			width: 35%;
		}
	}
</style>
