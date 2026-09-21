<script lang="ts">
	export let label: string | undefined = undefined;
	export let name: string;
	export let value = '';
	export let errors: string[] | undefined = undefined;
	export let labelClass = '';
	export let variant: 'horizontal' | 'vertical' = 'vertical';

	$: error = (errors ?? [])[0];
</script>

<label
	class="relative label flex {variant === 'horizontal'
		? 'flex-row flex-wrap gap-x-2 items-center'
		: 'flex-col gap-0'} flex-grow {labelClass}">
	{#if label}<span>{label}</span>{/if}
	<select
		class="select"
		class:flex-1={variant === 'horizontal'}
		{name}
		bind:value
		class:input-error={Boolean(error)}
		aria-invalid={error ? true : undefined}
		on:change>
		<slot />
	</select>
	{#if error}
		<p class="mt-1 w-full col-span-full text-xs text-error-500-400-token">
			{error}
		</p>
	{/if}
</label>
