<script lang="ts">
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
	import { _ } from 'svelte-i18n';
</script>

<StatelessModal title={$_('change-password')} on:close={close}>
	<form class="flex flex-col gap-6" method="post" use:enhance>
		{#if form?.errors?.global}
			<p class="text-xs text-error-500">{form.errors.global}</p>
		{/if}

		<div class="flex flex-wrap gap-4 items-center">
			<TextField
				required
				labelClass="w-full"
				label={$_('current-password')}
				name="currentPassword"
				type="password"
				autocomplete="current-password"
				errors={form?.errors?.currentPassword} />
			<TextField
				required
				label={$_('new-password')}
				name="newPassword"
				type="password"
				autocomplete="new-password"
				errors={form?.errors?.newPassword} />
			<TextField
				required
				label={$_('confirm-new-password')}
				name="newPasswordConfirm"
				type="password"
				autocomplete="new-password"
				errors={form?.errors?.newPasswordConfirm} />
		</div>

		<div class="flex flex-row justify-end">
			<Button>{$_('change-password')}</Button>
		</div>
	</form>
</StatelessModal>
