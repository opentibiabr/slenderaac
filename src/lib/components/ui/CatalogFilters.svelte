<script lang="ts">
	import { page } from '$app/stores';

	import PagePanel from './PagePanel.svelte';

	export let title: string;
	export let fields: readonly {
		name: string;
		title: string;
		values: readonly string[];
	}[];
	export let selected: Record<string, string>;
	export let sorts: Record<string, string>;
	$: classic = $page.data.selectedTheme === 'classic';
</script>

{#if !classic}<h3 class="h3">{title}</h3>{/if}
<PagePanel {title} surface variant="form">
	<div class="catalog-filters" class:catalog-filters--classic={classic}>
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
		border: 0;
		padding: 0;
		min-width: 0;
	}
	legend {
		font-weight: bold;
		width: 100%;
		padding: 2px 5px;
	}
	.catalog-filters__choices {
		padding: 2px 5px;
	}
	.catalog-filters__choices label {
		display: block;
		white-space: nowrap;
		line-height: 24px;
	}
	.catalog-filters__sort {
		padding: 2px 5px;
	}
	.catalog-filters__sort label {
		display: inline;
	}
	.catalog-filters--classic {
		margin: 0;
		border: 1px solid rgb(250 240 215);
		background: rgb(212 192 161);
	}
	.catalog-filters--classic fieldset:not(:last-child) {
		border-right: 1px solid rgb(250 240 215);
	}
	.catalog-filters--classic legend {
		border-bottom: 1px solid rgb(250 240 215);
		line-height: 16px;
	}
	.catalog-filters--classic .catalog-filters__choices label {
		line-height: normal;
	}
	.catalog-filters--classic .catalog-filters__sort {
		border-top: 1px solid rgb(250 240 215);
		line-height: normal;
	}
	@container (max-width: 480px) {
		.catalog-filters__groups {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
