<script lang="ts">
	import {
		faEdit,
		faHandHoldingHand,
		faPersonCirclePlus,
		faRefresh,
		faTrash,
	} from '@fortawesome/free-solid-svg-icons';
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	export let name: string;
	export let isOwner: boolean;
	export let isLeader: boolean;
	export let isVice: boolean;

	$: resigning = $page.data.resigning;
</script>

<div class="flex flex-row items-end gap-1">
	{#if isVice}
		<Button
			href={themePreviewHref(
				$page.url,
				`/guilds/${encodeURIComponent(name)}/invite`,
			)}
			size="sm"
			iconBefore={faPersonCirclePlus}>
			{$_('guilds.invite')}
		</Button>
	{/if}
	{#if isLeader}
		<Button
			href={themePreviewHref(
				$page.url,
				`/guilds/${encodeURIComponent(name)}/edit`,
			)}
			size="sm"
			color="secondary"
			iconBefore={faEdit}>
			{$_('guilds.edit')}
		</Button>
	{/if}
	{#if isOwner}
		{#if resigning}
			<Button
				href={themePreviewHref(
					$page.url,
					`/guilds/${encodeURIComponent(name)}`,
				)}
				size="sm"
				color="warning"
				iconBefore={faRefresh}>
				{$_('guilds.cancel-resign')}
			</Button>
		{:else}
			<Button
				href={themePreviewHref(
					$page.url,
					`/guilds/${encodeURIComponent(name)}/resign`,
				)}
				size="sm"
				color="warning"
				iconBefore={faHandHoldingHand}>
				{$_('guilds.resign')}
			</Button>
		{/if}
		<Button
			href={themePreviewHref(
				$page.url,
				`/guilds/${encodeURIComponent(name)}/disband`,
			)}
			size="xs"
			color="error"
			iconBefore={faTrash}>
			{$_('guilds.disband')}
		</Button>
	{/if}
</div>
