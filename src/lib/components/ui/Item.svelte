<script lang="ts">
	import { onDestroy } from 'svelte';
	import { tooltip } from 'svooltip';

	import { browser } from '$app/environment';

	import { fetchBackground, fetchItem } from '$lib/items';
	import { toProperCase } from '$lib/utils';

	export let item: number | string;

	let image = { src: '', alt: '' };
	let emptyBg = '';
	let request = 0;
	onDestroy(() => {
		request += 1;
	});

	async function loadImage(id: number | string) {
		const currentRequest = ++request;
		image = { src: '', alt: '' };
		emptyBg = '';
		if (!browser || !id) return;
		const [itemData, bg] = await Promise.all([
			fetchItem(id),
			fetchBackground(),
		]);
		if (currentRequest !== request) return;
		image = itemData;
		emptyBg = bg.src ? `url(${bg.src})` : '';
	}
	$: void loadImage(item);
</script>

<div class="w-9 h-9 rounded-sm bg-surface-500 flex justify-center items-center">
	<div style:--bg={emptyBg} class="item-image">
		{#key image.src}
			{#if image.src !== ''}
				<img
					src={image.src}
					alt={image.alt}
					on:error={() => {
						image = { ...image, src: '' };
					}}
					use:tooltip={{
						content: toProperCase(image.alt) ?? 'None',
						placement: 'top',
						offset: 0,
					}} />
			{:else if image.alt}
				<span title={image.alt} aria-label={image.alt}>?</span>
			{/if}
		{/key}
	</div>
</div>

<style scoped>
	.item-image {
		background-image: var(--bg);
	}
</style>
