<script lang="ts">
	import { _ } from 'svelte-i18n';

	import Button from '$lib/components/ui/Button.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { getThemeContext } from '$lib/themes/context';

	export let is2faEnabled: boolean;
	export let isVerified: boolean;
	export let isChangingEmail: boolean;
	const theme = getThemeContext();
	$: classic = $theme.profile.presentation.pageSurface === 'ornate';
</script>

<PagePanel title="Account Actions" variant="plain">
	<div class="flex flex-row flex-wrap justify-end gap-2">
		{#if isVerified}
			{#if is2faEnabled}
				<Button
					href={`/account/disable-2fa`}
					size="sm"
					color="error"
					noscroll={!classic}>
					{$_('disable-2fa.button')}
				</Button>
			{:else}
				<Button
					href={`/account/enable-2fa`}
					size="sm"
					color="success"
					noscroll={!classic}>
					{$_('enable-2fa')}
				</Button>
			{/if}
		{/if}
		<Button href={`/account/change-password`} size="sm" noscroll={!classic}>
			{$_('change-password')}
		</Button>
		{#if !isChangingEmail}
			<Button href={`/account/change-email`} size="sm" noscroll={!classic}>
				{$_('change-email')}
			</Button>
		{/if}
	</div>
</PagePanel>
