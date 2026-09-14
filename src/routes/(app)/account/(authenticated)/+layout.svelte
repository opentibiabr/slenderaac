<script lang="ts">
	import AccountActions from '$lib/components/ui/account/AccountActions.svelte';
	import AccountCharacters from '$lib/components/ui/account/AccountCharacters.svelte';
	import AccountInfoBox from '$lib/components/ui/account/AccountInfoBox.svelte';
	import ClassicAccountOverview from '$lib/components/ui/account/ClassicAccountOverview.svelte';
	import { getThemeContext } from '$lib/themes/context';

	import type { LayoutData } from './$types';

	export let data: LayoutData;
	const theme = getThemeContext();
	$: classic = $theme.profile.presentation.pageSurface === 'ornate';
</script>

{#if classic}
	<slot />
	<ClassicAccountOverview account={data.account} characters={data.characters} />
{:else}
	<div class="account-overview">
		<AccountInfoBox account={data.account} />
		<AccountActions
			is2faEnabled={data.account.is2faEnabled}
			isVerified={data.account.isVerified}
			isChangingEmail={Boolean(data.account.newEmail)} />
		<AccountCharacters characters={data.characters} />
	</div>
	<slot />
{/if}

<style>
	.account-overview {
		width: 100%;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	:global(.theme-classic) .account-overview {
		display: block;
	}
</style>
