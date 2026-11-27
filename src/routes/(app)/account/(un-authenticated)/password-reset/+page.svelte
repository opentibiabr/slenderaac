<script lang="ts">
	import { _ } from 'svelte-i18n';

	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/forms/TextField.svelte';
	import { enhance } from '$lib/enchance';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<form class="flex flex-col gap-4" method="post" use:enhance>
	{#if form?.errors?.global}
		<p class="text-error-500">{form.errors.global}</p>
	{/if}

	<input type="hidden" name="token" value={data.token} />
	{#if data.factorRequired}
		<TextField
			required
			label="Authenticator or recovery code"
			name="factor"
			type="text"
			autocomplete="one-time-code"
			errors={form?.errors?.factor} />
	{/if}

	<div class="flex flex-row gap-2">
		<TextField
			required
			label={$_('new-password')}
			name="password"
			type="password"
			autocomplete="new-password"
			errors={form?.errors?.password} />

		<TextField
			required
			label={$_('new-password-confirmation')}
			name="passwordConfirmation"
			type="password"
			autocomplete="new-password"
			errors={form?.errors?.passwordConfirmation} />
	</div>

	<div class="flex flex-row justify-end items-center gap-2">
		<Button>{$_('submit')}</Button>
	</div>
</form>
