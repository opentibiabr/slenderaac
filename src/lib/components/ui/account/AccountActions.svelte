<script lang="ts">
	import { _ } from 'svelte-i18n';

	import Button from '$lib/components/ui/Button.svelte';

	export let is2faEnabled: boolean;
	export let isVerified: boolean;
	export let isChangingEmail: boolean;
</script>

<div class="flex flex-row justify-between gap-2">
	<span />
	<div class="flex flex-row justify-start gap-2">
		{#if isVerified}
			{#if is2faEnabled}
				<Button href={`/account/disable-2fa`} size="sm" color="error" noscroll>
					{$_('disable-2fa.button')}
				</Button>
			{:else}
				<Button href={`/account/enable-2fa`} size="sm" color="success" noscroll>
					{$_('enable-2fa')}
				</Button>
			{/if}
		{/if}
		<Button href={`/account/change-password`} size="sm" noscroll>
			{$_('change-password')}
		</Button>
		{#if !isChangingEmail}
			<Button href={`/account/change-email`} size="sm" noscroll>
				{$_('change-email')}
			</Button>
		{/if}
	</div>
</div>
