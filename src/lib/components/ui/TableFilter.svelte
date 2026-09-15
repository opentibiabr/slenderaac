<script lang="ts">
	import Button from './Button.svelte';

	export let action: string;
	export let parameters = new URLSearchParams();
</script>

<form method="get" {action}>
	{#each Array.from(parameters) as [name, value]}<input
			type="hidden"
			{name}
			{value} />{/each}
	<table class="table-filter">
		<tbody
			><slot />
			<tr class="table-filter__submit"
				><td></td><td></td><td></td><td
					><Button type="submit">Submit</Button></td
				></tr>
		</tbody>
	</table>
</form>

<style>
	.table-filter {
		width: 100%;
		border-collapse: separate;
		border-spacing: 2px;
		font: inherit;
	}
	.table-filter :global(td) {
		padding: 1px;
		vertical-align: middle;
	}
	.table-filter :global(td:nth-child(odd)) {
		white-space: nowrap;
	}
	.table-filter :global(select) {
		max-width: 100%;
	}
	@media (max-width: 767px) {
		.table-filter {
			display: block;
		}
		.table-filter :global(tbody) {
			display: grid;
			grid-template-columns: max-content minmax(0, 1fr);
			gap: 4px 8px;
			margin: 4px 0;
		}
		.table-filter :global(tr) {
			display: contents;
		}
		.table-filter__submit td:empty {
			display: none;
		}
		.table-filter__submit td:last-child {
			grid-column: 2;
		}
	}
</style>
