<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import StatelessModal from '$lib/components/ui/StatelessModal.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	async function close() {
		await goto(themePreviewHref($page.url, '/account'), { noScroll: true });
	}
	import { _ } from 'svelte-i18n';

	import Button from '$lib/components/ui/Button.svelte';
	import Disable2FaForm from '$lib/components/ui/forms/Disable2FAForm.svelte';
</script>

<StatelessModal title={$_('enable-2fa')} on:close={close}>
	{#if !data.enabled}
		<h3 class="h3">Success!</h3>
		<p>{$_('disable-2fa.success')}</p>
		<p />
		<div class="flex flex-col items-center gap-4">
			<Button href={themePreviewHref($page.url, `/account`)} color="secondary"
				>{$_('close')}</Button>
		</div>
	{:else}
		<Disable2FaForm errors={form?.errors} />
	{/if}
</StatelessModal>
