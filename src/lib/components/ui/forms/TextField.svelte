<script lang="ts">
	export let label: string | undefined = undefined;
	export let name: string;
	export let value = '';
	export let placeholder: string | undefined = undefined;
	export let errors: string[] | undefined = undefined;
	export let autocomplete = 'off';
	export let type = 'text';
	export let labelClass = '';
	export let variant: 'horizontal' | 'vertical' = 'vertical';
	export let required = false;

	function typeAction(node: HTMLInputElement) {
		node.type = type;
	}
	$: error = (errors ?? [])[0];
</script>

<label
	class="relative label flex {variant === 'horizontal'
		? 'flex-row gap-2 items-center'
		: 'flex-col gap-0'} flex-grow {labelClass}">
	{#if label}<span>{label}</span>{/if}
	<input
		{required}
		bind:value
		{name}
		{placeholder}
		class="input flex-1"
		class:text-right={type === 'number'}
		class:input-error={Boolean(errors)}
		{autocomplete}
		on:input
		use:typeAction />
	{#if error}
		<p class="absolute top-full text-xs text-error-500-400-token">{error}</p>
	{/if}
</label>
