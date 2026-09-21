<script lang="ts">
	import PagePanel from '$lib/components/ui/PagePanel.svelte';

	export let title: string;
	export let fields: readonly {
		name: string;
		title: string;
		values: readonly string[];
	}[];
	export let selected: Record<string, string>;
	export let sorts: Record<string, string>;
</script>

<h3 class="h3">{title}</h3>
<PagePanel {title} surface variant="form">
	<div class="catalog-filters">
		<div
			class="catalog-filters__groups"
			style={`--filter-columns: ${fields.length}`}>
			{#each fields as field}
				<fieldset>
					<legend>{field.title}</legend>
					<div class="catalog-filters__choices">
						{#each ['', ...field.values] as value}
							<label
								><input
									type="radio"
									name={field.name}
									{value}
									checked={selected[field.name] === value} />
								{value || 'all'}</label>
						{/each}
					</div>
				</fieldset>
			{/each}
		</div>
		<div class="catalog-filters__sort">
			<label
				>Sort by: <select name="sort">
					{#each Object.entries(sorts) as [value, label]}<option
							{value}
							selected={selected.sort === value}>{label}</option
						>{/each}
				</select></label>
		</div>
	</div>
</PagePanel>

<style>
	.catalog-filters {
		container-type: inline-size;
		margin-block: 1em;
	}
	.catalog-filters__groups {
		display: grid;
		grid-template-columns: repeat(var(--filter-columns), minmax(0, 1fr));
	}
	fieldset {
		min-width: 0;
		padding: 0;
		border: 0;
	}
	legend {
		width: 100%;
		padding: 2px 5px;
		font-weight: bold;
	}
	.catalog-filters__choices {
		padding: 2px 5px;
	}
	.catalog-filters__choices label {
		display: block;
		line-height: 24px;
		white-space: nowrap;
	}
	.catalog-filters__sort {
		padding: 2px 5px;
	}
	.catalog-filters__sort label {
		display: inline;
	}
	@container (max-width: 480px) {
		.catalog-filters__groups {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
