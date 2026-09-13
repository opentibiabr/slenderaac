<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { goto } from '$app/navigation';

	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/forms/TextField.svelte';
	import StatelessModal from '$lib/components/ui/StatelessModal.svelte';
	import { enhance } from '$lib/enchance';

	import type { ActionData } from './$types';

	export let form: ActionData;

	async function close() {
		await goto('/account', { noScroll: true });
	}
</script>

<StatelessModal title={$_('change-email')} on:close={close}>
	<form class="flex flex-col gap-6" method="post" use:enhance>
		{#if form?.errors?.global}
			<p class="text-xs text-error-500">{form.errors.global}</p>
		{/if}

		<div class="flex flex-wrap gap-4 items-center">
			<TextField
				required
				labelClass="w-full"
				label={$_('password')}
				name="password"
				type="password"
				autocomplete="password"
				errors={form?.errors?.password} />
			<TextField
				required
				label={$_('new-email')}
				name="newEmail"
				type="email"
				errors={form?.errors?.newEmail} />
		</div>

		<div class="flex flex-row justify-end">
			<Button>{$_('change-email')}</Button>
		</div>
	</form>
</StatelessModal>
