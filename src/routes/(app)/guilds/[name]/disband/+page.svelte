<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/forms/TextField.svelte';
	import StatelessModal from '$lib/components/ui/StatelessModal.svelte';
	import { enhance } from '$lib/enchance';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: guild = data.guild;

	function close() {
		guild &&
			void goto(
				themePreviewHref(
					$page.url,
					`/guilds/${encodeURIComponent(guild.name)}`,
				),
			);
	}
</script>

{#if guild}
	<StatelessModal
		title={$_('guilds.disbanding-guild', { values: { name: guild.name } })}
		on:close={close}>
		<form class="flex flex-col gap-4" method="post" use:enhance>
			{#if form?.errors?.global}
				<p class="text-xs text-error-500">{form.errors.global}</p>
			{/if}

			<h4 class="h4">
				{$_('guilds.disband-confirmation', {
					values: { name: guild.name },
				})}
			</h4>
			<h4 class="h4 text-center">
				{@html $_('guilds.disband-not-reversible')}
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

			<div class="flex flex-row justify-end gap-2">
				<Button
					href={themePreviewHref(
						$page.url,
						`/guilds/${encodeURIComponent(guild.name)}`,
					)}
					color="primary"
					variant="ringed">{$_('guilds.cancel-disband')}</Button>
				<Button color="error"
					>{$_('guilds.confirm-disband', {
						values: { name: guild.name },
					})}</Button>
			</div>
		</form>
	</StatelessModal>
{/if}
