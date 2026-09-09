<script lang="ts">
	import { formatDuration } from 'date-fns';
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import type { AccountInfo } from '$lib/accounts';
	import Button from '$lib/components/ui/Button.svelte';
	import { themePreviewHref } from '$lib/themes/preview';
	import { formatDate } from '$lib/utils';

	import { PUBLIC_TITLE } from '$env/static/public';

	export let account: AccountInfo;
</script>

<div class="classic-account-section flex flex-col gap-2">
	<h3 class="h3">{$_('general-information')}</h3>

	<div class="data-table">
		<div class="data-row">
			<dt>{$_('email')}</dt>
			<dd>
				{account.email}
				{#if !account.isVerified}
					<div class="text-error-500">
						{@html $_('account.unverified')}
					</div>
				{:else if account.newEmail}
					<div class="text-warning-800-100-token">
						{$_('account.change-pending', {
							values: { email: account.newEmail },
						})}
						<form
							action={themePreviewHref($page.url, `/account/resend`)}
							method="post">
							<button class="anchor" type="submit"
								>{$_('account.resend')}</button>
						</form>
						)
					</div>
				{/if}
			</dd>
		</div>
		{#if account.premiumDays > 0}
			<div class="data-row">
				<dt>{$_('premium-days')}</dt>
				<dd>{formatDuration({ days: account.premiumDays })}</dd>
			</div>
		{/if}
		<div class="data-row">
			<dt>{$_('created')}</dt>
			<dd>{formatDate(account.createdAt)}</dd>
		</div>
		<div class="data-row">
			<dt>{$_('last-login')}</dt>
			<dd>{formatDate(account.lastLogin)}</dd>
		</div>
		<div class="data-row">
			<dt>{$_('game-coins', { values: { PUBLIC_TITLE } })}</dt>
			<dd class="flex flex-row items-center gap-2">
				{account.coins}
			</dd>
		</div>
		<div class="data-row">
			<dt>{$_('game-coins-trasferable', { values: { PUBLIC_TITLE } })}</dt>
			<dd class="flex flex-row items-center gap-2">
				{account.coinsTransferable}
				<Button
					href={themePreviewHref($page.url, `/shop/coins`)}
					size="sm"
					color="success"
					class="py-0.5 px-2">{$_('get-coins')}</Button>
			</dd>
		</div>
	</div>
</div>
