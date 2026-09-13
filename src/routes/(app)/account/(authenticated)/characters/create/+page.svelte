<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { goto } from '$app/navigation';

	import Button from '$lib/components/ui/Button.svelte';
	import CreateCharacterFormFields from '$lib/components/ui/create-character/CreateCharacterFormFields.svelte';
	import StatelessModal from '$lib/components/ui/StatelessModal.svelte';
	import { enhance } from '$lib/enchance';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	async function close() {
		await goto('/account', { noScroll: true });
	}
</script>

<StatelessModal title={$_('create-character')} on:close={close}>
	<form class="flex flex-col gap-4" method="post" use:enhance>
		{#if form?.errors?.global}
			<p class="text-xs text-error-500">{form.errors.global}</p>
		{/if}

		<CreateCharacterFormFields {form} availableTowns={data.availableTowns} />

		<div class="flex flex-row justify-end">
			<Button>{$_('create-character')}</Button>
		</div>
	</form>
</StatelessModal>
