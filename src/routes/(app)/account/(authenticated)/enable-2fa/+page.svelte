<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import StatelessModal from '$lib/components/ui/StatelessModal.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { ActionData, PageData } from './$types';
	import Enable2FAForm from '../../../../../lib/components/ui/forms/Enable2FAForm.svelte';

	export let data: PageData;
	export let form: ActionData;

	async function close() {
		await goto(themePreviewHref($page.url, '/account'), { noScroll: true });
	}
	import { _ } from 'svelte-i18n';

	import Button from '$lib/components/ui/Button.svelte';
</script>

<StatelessModal title={$_('enable-2fa')} on:close={close}>
	{#if data.enabled}
		<h3 class="h3">Success!</h3>
		<p>
			{$_('2fa-enabled.part1')}
		</p>
		<p>
			{$_('2fa-enabled.part2')}
		</p>
		<p>
			{$_('2fa-enabled.part3')}
		</p>
		<div class="flex flex-col items-center gap-4">
			{#if form?.success}
				<code class="card p-4 flex flex-wrap w-36 gap-2 justify-between">
					{#each form.recoveryCodes as code}
						<div>{code}</div>
					{/each}
				</code>
			{/if}
			<Button href={themePreviewHref($page.url, `/account`)} color="secondary"
				>{$_('close')}</Button>
		</div>
	{:else if data.qrCodeURL}
		<Enable2FAForm
			qrCodeURL={data.qrCodeURL}
			secret={data.secret}
			errors={form?.errors} />
	{/if}
</StatelessModal>
