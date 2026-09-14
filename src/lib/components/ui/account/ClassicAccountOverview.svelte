<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import type { AccountCharacter, AccountInfo } from '$lib/accounts';
	import AccountActions from '$lib/components/ui/account/AccountActions.svelte';
	import AccountCharacters from '$lib/components/ui/account/AccountCharacters.svelte';
	import AccountInfoBox from '$lib/components/ui/account/AccountInfoBox.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { themeAsset, type ThemeAssets } from '$lib/themes/assets';
	import { formatDate } from '$lib/utils';

	export let account: AccountInfo;
	export let characters: AccountCharacter[];

	let showManagement = false;

	$: assets = $page.data.themeAssets as ThemeAssets;
	$: isPremium = account.isPremium;
	$: blueButtonStyle = buttonStyle(
		assets,
		'smallButtonBackground',
		'smallButtonHover',
	);
	$: greenButtonStyle = buttonStyle(
		assets,
		'greenButtonBackground',
		'greenButtonHover',
	);
	$: redButtonStyle = buttonStyle(
		assets,
		'redButtonBackground',
		'redButtonHover',
	);

	function buttonStyle(
		themeAssets: ThemeAssets,
		backgroundKey:
			| 'smallButtonBackground'
			| 'greenButtonBackground'
			| 'redButtonBackground',
		hoverKey: 'smallButtonHover' | 'greenButtonHover' | 'redButtonHover',
	) {
		return [
			themeAsset(themeAssets, backgroundKey)
				? `--classic-native-button: url("${themeAsset(themeAssets, backgroundKey)}")`
				: '',
			themeAsset(themeAssets, hoverKey)
				? `--classic-native-button-hover: url("${themeAsset(themeAssets, hoverKey)}")`
				: '',
		]
			.filter(Boolean)
			.join('; ');
	}
</script>

<div class="classic-account-overview">
	<div class="classic-account-overview__welcome">
		{#if themeAsset(assets, 'headlineBracerLeft')}<img
				src={themeAsset(assets, 'headlineBracerLeft') ?? ''}
				alt=""
				aria-hidden="true" />{/if}
		<strong
			>{$_('account.classic.welcome', {
				values: { name: account.name },
			})}</strong>
		{#if themeAsset(assets, 'headlineBracerRight')}<img
				src={themeAsset(assets, 'headlineBracerRight') ?? ''}
				alt=""
				aria-hidden="true" />{/if}
	</div>

	<div class="classic-account-overview__status-panel">
		<PagePanel
			title={$_('account.classic.account-status')}
			variant="list"
			surface
			spacing="related">
			<div class="classic-account-overview__status-card">
				<div class="classic-account-overview__status-main">
					<div class="classic-account-overview__status-copy">
						{#if themeAsset(assets, 'accountStatusFree')}<img
								class:classic-account-overview__status-icon--premium={isPremium}
								src={themeAsset(assets, 'accountStatusFree') ?? ''}
								alt="" />{/if}
						<div>
							<strong
								>{isPremium
									? $_('account.classic.premium-account')
									: $_('account.classic.free-account')}</strong>
							<span>
								{#if account.premiumGranted}
									{$_('account.classic.vip-granted')}
								{:else if account.premiumExpiresAt}
									{$_(
										isPremium
											? 'account.classic.vip-active'
											: 'account.classic.vip-expired',
										{
											values: { date: formatDate(account.premiumExpiresAt) },
										},
									)}
								{:else}
									{$_('account.classic.vip-empty')}
								{/if}
								{$_('account.classic.vip-balance', {
									values: { days: account.premiumDays },
								})}
							</span>
						</div>
					</div>
					<div class="classic-account-overview__actions">
						<button
							class="btn"
							type="button"
							style={blueButtonStyle}
							aria-expanded={showManagement}
							aria-controls="classic-account-management"
							on:click={() => (showManagement = !showManagement)}>
							{showManagement
								? $_('account.classic.close-management')
								: $_('account.classic.manage-account')}
						</button>
						<a class="btn" href="/shop/coins" style={greenButtonStyle}
							>{$_('get-coins')}</a>
						<form action="/account/logout" method="post">
							<button class="btn" type="submit" style={redButtonStyle}
								>{$_('logout')}</button>
						</form>
					</div>
				</div>

				<div class="classic-account-overview__benefits">
					<div>
						{#if themeAsset(assets, 'accountBenefitTraining')}<img
								src={themeAsset(assets, 'accountBenefitTraining') ?? ''}
								alt="" />{/if}
						<span>{$_('account.classic.benefit-characters')}</span>
					</div>
					<div>
						{#if themeAsset(assets, 'accountBenefitGuild')}<img
								src={themeAsset(assets, 'accountBenefitGuild') ?? ''}
								alt="" />{/if}
						<span>{$_('account.classic.benefit-guilds')}</span>
					</div>
					<div>
						{#if themeAsset(assets, 'accountBenefitSecurity')}<img
								src={themeAsset(assets, 'accountBenefitSecurity') ?? ''}
								alt="" />{/if}
						<span>{$_('account.classic.benefit-security')}</span>
					</div>
				</div>
			</div>
		</PagePanel>
	</div>

	{#if showManagement}
		<div
			id="classic-account-management"
			class="classic-account-overview__management">
			<AccountInfoBox {account} />
			<AccountActions
				is2faEnabled={account.is2faEnabled}
				isVerified={account.isVerified}
				isChangingEmail={Boolean(account.newEmail)} />
		</div>
	{/if}

	<PagePanel
		title={$_('account.classic.download-client')}
		variant="list"
		surface
		spacing="related">
		<a class="classic-account-overview__download" href="/download">
			<span
				>{$_('account.classic.download-prompt', {
					values: { serverName: $page.data.serverName },
				})}</span>
			<span class="classic-account-overview__download-action">
				{#if themeAsset(assets, 'accountDownloadWindows')}<img
						src={themeAsset(assets, 'accountDownloadWindows') ?? ''}
						alt="" />{/if}
				<strong>{$_('download')}</strong>
			</span>
		</a>
	</PagePanel>

	<AccountCharacters {characters} />
</div>

<style>
	.classic-account-overview__welcome {
		height: 50px;
		margin-bottom: 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		font-size: 14px;
	}
	.classic-account-overview__welcome img {
		width: 52px;
		height: 16px;
		image-rendering: pixelated;
	}
	.classic-account-overview__status-card {
		min-height: 138px;
		display: flex;
		flex-direction: column;
	}
	.classic-account-overview__status-main {
		min-height: 67px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		padding: 5px 7px;
	}
	.classic-account-overview__status-copy {
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.classic-account-overview__status-copy > img {
		flex: none;
		width: 42px;
		height: 42px;
		image-rendering: pixelated;
	}
	.classic-account-overview__status-icon--premium {
		filter: hue-rotate(105deg) saturate(0.9);
	}
	.classic-account-overview__status-copy strong,
	.classic-account-overview__status-copy span {
		display: block;
	}
	.classic-account-overview__status-copy span {
		margin-top: 3px;
		font-size: 10px;
		line-height: 14px;
	}
	.classic-account-overview__actions {
		flex: none;
		display: flex;
		gap: 4px;
	}
	.classic-account-overview__actions form {
		margin: 0;
	}
	.classic-account-overview__benefits {
		min-height: 63px;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-top: 1px solid rgb(250 240 215);
		background: rgb(238 220 191);
	}
	.classic-account-overview__benefits > div {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		padding: 5px 10px;
		border-right: 1px solid rgb(212 192 161);
		font-size: 10px;
		line-height: 13px;
	}
	.classic-account-overview__benefits > div:last-child {
		border-right: 0;
	}
	.classic-account-overview__benefits img {
		width: 32px;
		height: 32px;
		flex: none;
	}
	.classic-account-overview__management {
		margin-bottom: 15px;
	}
	.classic-account-overview__download {
		min-height: 61px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 4px 10px 4px 14px;
		color: inherit;
		text-decoration: none;
	}
	.classic-account-overview__download > span:first-child {
		color: rgb(0 66 148);
		font-weight: bold;
	}
	.classic-account-overview__download-action {
		min-width: 105px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		color: rgb(90 40 0);
	}
	.classic-account-overview__download-action img {
		width: 45px;
		height: 45px;
		image-rendering: pixelated;
	}
	@media (max-width: 800px) {
		.classic-account-overview__status-main {
			align-items: stretch;
			flex-direction: column;
		}
		.classic-account-overview__actions {
			flex-wrap: wrap;
		}
		.classic-account-overview__benefits {
			grid-template-columns: 1fr;
		}
		.classic-account-overview__benefits > div {
			justify-content: flex-start;
			border-right: 0;
			border-bottom: 1px solid rgb(212 192 161);
		}
		.classic-account-overview__benefits > div:last-child {
			border-bottom: 0;
		}
	}
</style>
