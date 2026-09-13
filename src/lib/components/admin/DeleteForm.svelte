<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import { getModalStore } from '@skeletonlabs/skeleton';

	import { applyAction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$lib/enchance';

	export let action: string;
	export let title: string;
	export let message: string;
	export let fields: Record<string, string> = {};
	const modal = getModalStore();
	const confirm: SubmitFunction = async ({ cancel }) => {
		const approved = await new Promise<boolean>((resolve) =>
			modal.trigger({
				type: 'confirm',
				title,
				body: message,
				response: resolve,
			}),
		);
		if (!approved) {
			cancel();
			return;
		}
		return async ({ result, update }) => {
			if (
				result.type === 'redirect' &&
				new URL(result.location, $page.url).href === $page.url.href
			)
				await invalidateAll();
			else if (result.type === 'failure') await applyAction(result);
			else await update();
		};
	};
</script>

<form method="post" {action} use:enhance={confirm}>
	{#each Object.entries(fields) as [name, value]}<input
			type="hidden"
			{name}
			{value} />{/each}
	<Button type="submit" size="sm" color="error">Delete</Button>
</form>
