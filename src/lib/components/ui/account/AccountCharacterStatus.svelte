<script lang="ts">
	import {
		faCheck,
		faCircleQuestion,
		faEyeSlash,
		faGift,
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';
	import { tooltip } from 'svooltip';

	import { page } from '$app/stores';

	import type { DailyRewardState } from '$lib/accounts';

	export let dailyReward: DailyRewardState;
	export let hidden = false;
	$: rewardIcon =
		dailyReward === 'unknown'
			? null
			: dailyReward === 'collected'
				? $page.data.accountStatusAssets.rewardCollected
				: $page.data.accountStatusAssets.rewardUncollected;
	$: hiddenIcon = $page.data.accountStatusAssets.characterHidden;
	$: rewardLabel = $_(`account.reward-${dailyReward}`);
</script>

<span class="account-character-status">
	<span
		class="account-character-status__icon"
		role="img"
		aria-label={rewardLabel}
		use:tooltip={{ content: rewardLabel }}>
		{#if rewardIcon}
			<img src={rewardIcon} alt="" width="11" height="19" />
		{:else}
			<Fa
				icon={dailyReward === 'collected'
					? faCheck
					: dailyReward === 'uncollected'
						? faGift
						: faCircleQuestion} />
		{/if}
	</span>
	{#if hidden}
		<span
			class="account-character-status__icon"
			role="img"
			aria-label={$_('account.character-hidden')}
			use:tooltip={{ content: $_('account.character-hidden') }}>
			{#if hiddenIcon}<img src={hiddenIcon} alt="" width="11" height="19" />
			{:else}<Fa icon={faEyeSlash} />{/if}
		</span>
	{/if}
</span>

<style>
	.account-character-status {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.account-character-status__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 11px;
		height: 19px;
		font-size: 12px;
	}
	.account-character-status__icon img {
		width: 11px;
		height: 19px;
		max-width: none;
	}
</style>
