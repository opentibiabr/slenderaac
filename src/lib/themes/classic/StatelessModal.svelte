<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import Button from '$lib/components/ui/Button.svelte';

	import PagePanel from './PagePanel.svelte';

	const dispatch = createEventDispatcher();
	export let title: string;

	function close() {
		dispatch('close');
	}
</script>

<PagePanel {title}>
	<slot />
	<div class="classic-actions">
		<Button type="button" on:click={close}>Close</Button>
	</div>
</PagePanel>

<style>
	.classic-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
</style>
