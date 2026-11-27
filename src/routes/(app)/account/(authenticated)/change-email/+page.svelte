<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { goto } from '$app/navigation';

	import Button from '$lib/components/ui/Button.svelte';
	import CredentialPasswordField from '$lib/components/ui/forms/CredentialPasswordField.svelte';
	import TextField from '$lib/components/ui/forms/TextField.svelte';
	import StatelessModal from '$lib/components/ui/StatelessModal.svelte';
	import { enhance } from '$lib/enchance';

	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;

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
			<CredentialPasswordField
				label={$_('password')}
				name="password"
				autocomplete="current-password"
				errors={form?.errors?.password} />
			<TextField
				required
				label={$_('new-email')}
				name="newEmail"
				type="email"
				errors={form?.errors?.newEmail} />
		</div>

		{#if data.account.is2faEnabled}
			<TextField
				required
				label={$_('account.recovery-factor')}
				name="factor"
				type="text"
				autocomplete="one-time-code"
				errors={form?.errors?.factor} />
		{:else if data.account.isVerified}
			<p>{$_('account.approve-both-emails')}</p>
		{/if}
		<div class="flex flex-row justify-end">
			<Button>{$_('change-email')}</Button>
		</div>
	</form>
</StatelessModal>
