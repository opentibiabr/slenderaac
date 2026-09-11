<script lang="ts">
	export let label: string;
	export let name: string;
	export let checked = false;
	export let errors: string[] | undefined;
	export let labelClass = '';

	$: error = (errors ?? [])[0];
</script>

<label
	class="relative label flex flex-row flex-wrap gap-x-2 items-center flex-grow {labelClass}">
	<input
		class="checkbox"
		class:input-error={Boolean(error)}
		aria-invalid={error ? true : undefined}
		type="checkbox"
		{name}
		bind:checked />
	<p class="flex-1 min-w-0">{label}</p>
	{#if error}
		<p class="mt-1 w-full col-span-full text-xs text-error-500-400-token">
			{error}
		</p>
	{/if}
</label>
