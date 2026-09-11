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
		? 'flex-row flex-wrap gap-x-2 items-center'
		: 'flex-col gap-0'} flex-grow {labelClass}">
	{#if label}<span>{label}</span>{/if}
	<input
		{required}
		bind:value
		{name}
		{placeholder}
		class="input flex-1"
		class:text-right={type === 'number'}
		class:input-error={Boolean(error)}
		aria-invalid={error ? true : undefined}
		{autocomplete}
		on:input
		use:typeAction />
	{#if error}
		<p class="mt-1 w-full col-span-full text-xs text-error-500-400-token">
			{error}
		</p>
	{/if}
</label>
