<script lang="ts">
	import { faClose } from '@fortawesome/free-solid-svg-icons';
	import { Toast } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { Body } from 'svelte-body';
	import Fa from 'svelte-fa';
	import { portal } from 'svelte-portal';

	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import Button from './Button.svelte';
	import PagePanel from './PagePanel.svelte';

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	export let title: string;
</script>

{#if $page.data.selectedTheme === 'classic'}
	<PagePanel {title}
		><slot />
		<div class="classic-actions">
			<Button type="button" on:click={close}>Close</Button>
		</div></PagePanel>
{:else}
	<Body class="overflow-hidden" />

	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<dialog
		class="modal-backdrop fixed inset-0 bg-surface-backdrop-token w-full h-full flex items-center justify-center"
		on:click|self={close}
		on:keypress={(e) => e.key === 'Escape' && close()}
		transition:fade
		use:portal={'body'}>
		{#if browser}
			<Toast />
		{/if}

		<div
			class="modal flex flex-col bg-surface-100-800-token w-modal h-auto max-h-full overflow-hidden p-4 space-y-4 rounded-container-token shadow-xl transition-all duration-300"
			role="dialog"
			transition:scale
			aria-modal="true"
			aria-label={title}>
			<header
				class="text-2xl font-bold flex flex-row justify-between items-center">
				{title}
				<button on:click={close}><Fa icon={faClose} size="xs" /></button>
			</header>
			<div class="flex flex-col gap-2 h-auto overflow-y-auto">
				<slot />
			</div>
		</div>
	</dialog>
{/if}
