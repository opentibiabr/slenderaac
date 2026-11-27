<script lang="ts">
	export let name: string;
	export let label: string;
	export let autocomplete: 'current-password' | 'new-password';
	export let errors: string[] | undefined = undefined;
</script>

<label class="label w-full">
	<span>{label}</span>
	<input
		required
		class="input"
		class:input-error={Boolean(errors?.length)}
		{name}
		type="password"
		{autocomplete}
		aria-invalid={errors?.length ? true : undefined} />
	{#if errors?.[0]}
		<span class="text-xs text-error-500">{errors[0]}</span>
	{/if}
</label>
