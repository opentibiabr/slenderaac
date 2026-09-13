<script lang="ts">
	import { goto } from '$app/navigation';

	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/forms/TextField.svelte';
	import StatelessModal from '$lib/components/ui/StatelessModal.svelte';
	import { enhance } from '$lib/enchance';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	async function close() {
		await goto('/account', { noScroll: true });
	}
	import { _ } from 'svelte-i18n';
</script>

<StatelessModal title={$_('delete-character')} on:close={close}>
	<form class="flex flex-col gap-4" method="post" use:enhance>
		{#if form?.errors?.global}
			<p class="text-xs text-error-500">{form.errors.global}</p>
		{/if}

		<h4 class="h4">
			{$_('delete-confirmation-description', { values: { name: data.name } })}
		</h4>
		<div class="w-full">
			<TextField
				required
				type="password"
				name="password"
				label={$_('password')}
				labelClass="!flex-row items-center gap-2"
				errors={form?.errors?.password} />
		</div>

		<div class="flex flex-row justify-end">
			<Button color="error">{$_('confirm-deletion')}</Button>
		</div>
	</form>
</StatelessModal>
