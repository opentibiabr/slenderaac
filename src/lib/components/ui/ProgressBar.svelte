<script lang="ts">
	import { fade } from 'svelte/transition';

	import { portal } from '$lib/actions/portal';

	export let infinite = false;
	export let progress = 0;

	$: progressStyle = `width: ${progress * 100}%`;
</script>

<div
	transition:fade={{ duration: 100 }}
	class="flex flex-row fixed h-1 top-0 left-0 w-full overflow-x-hidden bg-surface-100/50"
	use:portal>
	<div class="absolute h-full bg-secondary-500/30 w-full" />
	{#if infinite}
		<div class="absolute h-full bg-secondary-500 animate-increase" />
		<div class="absolute h-full bg-secondary-500 animate-decrease" />
	{:else}
		<div class="absolute h-full bg-secondary-500" style={progressStyle} />
	{/if}
</div>

<style lang="postcss">
	.animate-increase {
		animation: increase 2s infinite;
	}
	.animate-decrease {
		animation: decrease 2s 0.5s infinite;
	}

	@keyframes increase {
		from {
			left: -5%;
			width: 5%;
		}
		to {
			left: 130%;
			width: 100%;
		}
	}

	@keyframes decrease {
		from {
			left: -80%;
			width: 80%;
		}
		to {
			left: 110%;
			width: 10%;
		}
	}
</style>
