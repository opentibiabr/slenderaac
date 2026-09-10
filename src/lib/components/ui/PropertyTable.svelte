<script lang="ts">
	import { page } from '$app/stores';

	import TableSurface from '$lib/themes/classic/TableSurface.svelte';

	export let title: string;
	export let rows: {
		label: string;
		value: string;
		href?: string;
		external?: boolean;
		strong?: boolean;
	}[];
</script>

<TableSurface assets={$page.data.themeAssets} width="100%">
	<table
		class="classic-data-table property-table"
		class:table={$page.data.selectedTheme !== 'classic'}
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
	:global(.theme-classic .classic-native-content)
		.property-table
		tr:nth-child(n) {
		background: transparent;
	}
	:global(.theme-classic .classic-native-content) .property-table th {
		box-sizing: content-box;
		width: 150px;
	}
	@media (max-width: 767px) {
		:global(.theme-classic .classic-native-content) .property-table th {
			width: 35%;
		}
	}
</style>
