<script lang="ts">
	import { onMount } from 'svelte';

	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import TableSurface from '$lib/themes/classic/TableSurface.svelte';

	export let action: string;
	export let name: string;
	export let label: string;
	export let selected: string;
	export let choices: { value: string; label: string }[];
	export let parameters = new URLSearchParams();
	let ready = false;
	onMount(() => {
		ready = true;
	});
</script>

<form method="get" {action}>
	{#each Array.from(parameters) as [name, value]}<input
			type="hidden"
			{name}
			{value} />{/each}
	<TableSurface assets={$page.data.themeAssets} width="100%">
		<table class="classic-data-table auto-select-form" aria-label={label}>
			<tbody
				><tr
					><th scope="row"><label for={`select-${name}`}>{label}</label></th>
					<td class="auto-select-form__control">
						<select
							id={`select-${name}`}
							{name}
							class="select"
							on:change={(event) => event.currentTarget.form?.requestSubmit()}>
							<option value="" selected={!selected}>---</option>
							{#each choices as choice}<option
									value={choice.value}
									selected={selected === choice.value}>{choice.label}</option
								>{/each}
						</select>
					</td><td
						><div hidden={ready}><Button type="submit">Submit</Button></div></td
					></tr
				></tbody>
		</table>
	</TableSurface>
</form>

<style>
	.auto-select-form {
		width: 100%;
	}
	.auto-select-form__control {
		width: 80%;
	}
	.auto-select-form select {
		min-width: 0;
		width: 100%;
	}
	:global(.theme-classic .classic-native-content)
		.auto-select-form
		tr:nth-child(n) {
		background: transparent;
	}
	:global(.theme-classic .classic-native-content) .auto-select-form th {
		box-sizing: content-box;
		width: 150px;
		white-space: nowrap;
		vertical-align: middle;
	}
	:global(.theme-classic .classic-native-content) .auto-select-form select {
		height: 19px;
		padding: 0;
		border: 1px solid #767676;
	}
	@media (max-width: 767px) {
		.auto-select-form,
		.auto-select-form tbody,
		.auto-select-form tr,
		.auto-select-form td,
		.auto-select-form th {
			display: block;
			width: 100%;
		}
		:global(.theme-classic .classic-native-content) .auto-select-form th {
			box-sizing: border-box;
			width: 100%;
		}
		.auto-select-form td:has([hidden]) {
			display: none;
		}
	}
</style>
