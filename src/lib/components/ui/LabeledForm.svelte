<script lang="ts">
	import Button from './Button.svelte';

	export let action: string;
	export let label: string;
	export let fieldId: string;
	export let parameters = new URLSearchParams();
	export let variant: 'native' | 'plain' = 'plain';
</script>

<form
	method="get"
	{action}
	class="labeled-form"
	class:labeled-form--plain={variant === 'plain'}>
	{#each Array.from(parameters) as [name, value]}
		<input type="hidden" {name} {value} />
	{/each}
	<label for={fieldId}>{label}</label>
	<slot />
	<Button type="submit">Submit</Button>
</form>

<style>
	.labeled-form {
		display: flex;
		gap: 5px;
		padding: 5px 5px 5px 0;
		align-items: flex-start;
	}
	.labeled-form--plain {
		padding: 8px 8px 8px 3px;
	}
	label {
		flex: 0 0 130px;
		min-width: 0;
		padding-right: 10px;
		font-weight: bold;
		white-space: nowrap;
	}
	:global(.labeled-form > :is(input:not([type='hidden']), select)) {
		flex: 1;
		width: 0;
		min-width: 0;
	}
	@media (max-width: 767px) {
		.labeled-form {
			flex-wrap: wrap;
		}
		label {
			flex-basis: 100%;
		}
	}
</style>
