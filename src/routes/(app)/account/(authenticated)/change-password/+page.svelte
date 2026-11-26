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

<StatelessModal title={$_('change-password')} on:close={close}>
	<form class="flex flex-col gap-6" method="post" use:enhance>
		{#if form?.errors?.global}
			<p class="text-xs text-error-500">{form.errors.global}</p>
		{/if}

		<div class="flex flex-wrap gap-4 items-center">
			<CredentialPasswordField
				label={$_('current-password')}
				name="currentPassword"
				autocomplete="current-password"
				errors={form?.errors?.currentPassword} />
			<CredentialPasswordField
				label={$_('new-password')}
				name="newPassword"
				autocomplete="new-password"
				errors={form?.errors?.newPassword} />
			<CredentialPasswordField
				label={$_('confirm-new-password')}
				name="newPasswordConfirm"
				autocomplete="new-password"
				errors={form?.errors?.newPasswordConfirm} />
			{#if data.tokenRequired || (form && 'tokenRequired' in form && form.tokenRequired)}
				<TextField
					required
					labelClass="w-full"
					label={$_('token')}
					name="token"
					autocomplete="one-time-code"
					errors={form?.errors?.token} />
			{/if}
		</div>

		<div class="flex flex-row justify-end">
			<Button>{$_('change-password')}</Button>
		</div>
	</form>
</StatelessModal>
