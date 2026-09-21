<script lang="ts">
	export let label: string | undefined = undefined;
	export let name: string;
	export let value = '';
	export let rows = 4;
	export let errors: string[] | undefined = undefined;
	export let labelClass = '';
	export let variant: 'horizontal' | 'vertical' = 'vertical';
	export let required = false;
	export let placeholder = '';

	$: error = (errors ?? [])[0];
</script>

<label
	class="relative label flex {variant === 'horizontal'
		? 'flex-row flex-wrap gap-x-2 items-center'
		: 'flex-col gap-0'} flex-grow {labelClass}">
	{#if label}<span>{label}</span>{/if}
	<textarea
		{name}
		{rows}
		{placeholder}
		{required}
		class:input-error={Boolean(error)}
		aria-invalid={error ? true : undefined}
		class="textarea"
		class:flex-1={variant === 'horizontal'}
		bind:value />

	{#if error}
		<p class="mt-1 w-full col-span-full text-xs text-error-500-400-token">
			{error}
		</p>
	{/if}
</label>
