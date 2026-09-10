<script lang="ts">
	import { onMount } from 'svelte';

	export let src: string | null | undefined;
	export let alt: string;
	export let width: number;
	export let height: number;
	export let fit: 'contain' | 'cover' = 'contain';
	let image: HTMLImageElement | undefined;
	let failed = false;
	$: {
		src;
		failed = false;
	}
	onMount(() => {
		if (image?.complete && !image.naturalWidth) failed = true;
	});
</script>

{#if src && !failed}<img
		bind:this={image}
		{src}
		{alt}
		{width}
		{height}
		style:width={`${width}px`}
		style:height={`${height}px`}
		style:object-fit={fit}
		on:error={() => (failed = true)} />{:else}<slot>{alt}</slot>{/if}

<style>
	img {
		max-width: 100%;
		vertical-align: middle;
	}
</style>
