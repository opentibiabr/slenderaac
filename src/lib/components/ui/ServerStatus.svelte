<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import { pollOnlineStatus } from '$lib/online-status';
	import { themePreviewHref } from '$lib/themes/preview';

	let serverOnline: boolean;
	let onlinePlayerCount: number;

	onMount(() =>
		pollOnlineStatus((status) => {
			({ onlinePlayerCount, serverOnline } = status);
		}),
	);
</script>

<a
	href={themePreviewHref($page.url, '/online')}
	class="text-xs px-2 rounded-full py-1 flex flex-row items-center gap-1 bg-surface-200/75 whitespace-nowrap">
	{#if serverOnline}
		<div class="w-2 h-2 rounded-full bg-success-500" />
		<div class="text-success-500">{$_('online')}</div>
		{$_('layout.onlinePlayerCount', { values: { onlinePlayerCount } })}
	{:else if serverOnline === false}
		<div class="w-2 h-2 rounded-full bg-error-500" />
		<div class="text-error-500">{$_('offline')}</div>
	{:else}
		<div class="w-2 h-2 rounded-full bg-surface-500" />
		<div>{$_('server-status-unknown')}</div>
	{/if}
</a>
