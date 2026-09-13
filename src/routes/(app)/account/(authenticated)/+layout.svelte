<script lang="ts">
	import { page } from '$app/stores';

	import AccountActions from '$lib/components/ui/account/AccountActions.svelte';
	import AccountCharacters from '$lib/components/ui/account/AccountCharacters.svelte';
	import AccountInfoBox from '$lib/components/ui/account/AccountInfoBox.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';

	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

{#if $page.data.selectedTheme === 'classic'}<slot />{/if}
<div class="flex flex-col gap-2">
	<PagePanel title="Account Information" surface
		><AccountInfoBox account={data.account} /></PagePanel>
	<PagePanel title="Account Actions">
		<AccountActions
			is2faEnabled={data.account.is2faEnabled}
			isVerified={data.account.isVerified}
			isChangingEmail={Boolean(data.account.newEmail)} />
	</PagePanel>
	<PagePanel title="Characters" surface
		><AccountCharacters characters={data.characters} /></PagePanel>
</div>

{#if $page.data.selectedTheme !== 'classic'}<slot />{/if}
