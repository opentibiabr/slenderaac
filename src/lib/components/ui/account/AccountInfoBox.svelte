<script lang="ts">
	import { formatDuration } from 'date-fns';
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import type { AccountInfo } from '$lib/accounts';
	import Button from '$lib/components/ui/Button.svelte';
	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { getThemeContext } from '$lib/themes/context';
	import { formatDate } from '$lib/utils';

	export let account: AccountInfo;
	const theme = getThemeContext();
	$: classic = $theme.profile.presentation.pageSurface === 'ornate';
</script>

{#if !classic}<h3 class="h3">{$_('general-information')}</h3>{/if}

<PagePanel title={$_('general-information')} variant="list" surface>
	<CatalogTable>
		<div class:table-container={!classic}>
			<table
				class="account-info"
				class:table={!classic}
				class:classic-data-table={classic}
				class:classic-data-table--grid={classic}
				class:classic-data-table--labels={classic}
				aria-label={$_('general-information')}>
				<tbody>
					<tr>
						<th scope="row">{$_('email')}</th>
						<td>
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
									<form action={`/account/resend`} method="post">
										<button class="anchor" type="submit"
											>{$_('account.resend')}</button>
									</form>
									)
								</div>
							{/if}
						</td>
					</tr>
					{#if account.premiumDays > 0}
						<tr>
							<th scope="row">{$_('premium-days')}</th>
							<td>{formatDuration({ days: account.premiumDays })}</td>
						</tr>
					{/if}
					<tr>
						<th scope="row">{$_('created')}</th>
						<td>{formatDate(account.createdAt)}</td>
					</tr>
					<tr>
						<th scope="row">{$_('last-login')}</th>
						<td>{formatDate(account.lastLogin)}</td>
					</tr>
					<tr>
						<th scope="row">
							{$_('game-coins', {
								values: { PUBLIC_TITLE: $page.data.serverName },
							})}
						</th>
						<td>
							{account.coins}
						</td>
					</tr>
					<tr>
						<th scope="row">
							{$_('game-coins-trasferable', {
								values: { PUBLIC_TITLE: $page.data.serverName },
							})}
						</th>
						<td>
							{account.coinsTransferable}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</CatalogTable>
	<div slot="after-surface" class="flex justify-end mt-2">
		<Button href="/shop/coins" size="sm" color="success"
			>{$_('get-coins')}</Button>
	</div>
</PagePanel>

<style>
	.account-info {
		width: 100%;
	}
	.account-info :is(th, td) {
		white-space: normal;
		overflow-wrap: anywhere;
	}
	.account-info th {
		text-align: left;
	}
	:global(.layout-surface-cards) .account-info th {
		width: 40%;
	}
	@media (min-width: 768px) {
		:global(.layout-surface-ornate) .account-info th {
			white-space: nowrap;
		}
	}
</style>
