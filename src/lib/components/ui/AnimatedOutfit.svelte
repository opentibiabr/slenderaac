<script lang="ts">
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	import { browser } from '$app/environment';

	import { outfitURL } from '$lib/players';

	type Outfit = {
		looktype: number;
		lookaddons?: number;
		lookhead?: number;
		lookbody?: number;
		looklegs?: number;
		lookfeet?: number;
		mount?: number | null;
		lookmount?: number | null;
	};
	export let outfit: Outfit;

	export let alt: string;
	let klass = '';
	export { klass as class };
	export let innerClass = '';

	type Frame = {
		image: HTMLImageElement;
		duration: number;
	};
	let canvas: HTMLCanvasElement | null = null;
	let frames: Frame[] = [];
	$: context = canvas?.getContext('2d', {});

	$: void sourceChanged(outfit);

	async function sourceChanged(outfit: Outfit) {
		frames = [];

		if (!outfit || !browser) return;
		const response = await fetch(
			outfitURL({
				...outfit,
				mount: outfit.mount ?? outfit.lookmount ?? 0,
				resize: true,
			}),
		);
		const data = await response.json();
		const nextFrames = Array.isArray(data?.frames) ? data.frames : [];
		frames = (nextFrames as { duration: number; image: string }[]).map(
			(frame) => ({
				...frame,
				image: (() => {
					const image = new Image();
					image.src = frame.image;
					return image;
				})(),
			}),
		);
	}

	let index = 0;
	let shownFor = 1000;
	const hasMount =
		(outfit.lookmount && outfit.lookmount > 0) ||
		(outfit.mount && outfit.mount > 0);

	onMount(() => {
		const interval = setInterval(() => {
			if (!canvas || !context || frames.length === 0) {
				return;
			}

			shownFor += 50;
			if (shownFor >= frames[index].duration) {
				shownFor = 0;
				index++;
				if (index >= frames.length) {
					index = 0;
				}
			} else {
				return;
			}

			const frame = frames[index];
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(
				frame.image,
				0,
				0,
				frame.image.width,
				frame.image.height,
				0,
				0,
				canvas.width,
				canvas.height,
			);
		}, 50);
		return () => clearInterval(interval);
	});
</script>

<div class="relative w-12 h-12 {klass} overflow-visible">
	<slot />
	<div
		class="absolute {hasMount
			? '-left-7 -bottom-1'
			: '-left-10 bottom-1'} {innerClass}">
		{#if frames && outfit.looktype > 0}
			<canvas bind:this={canvas} class="w-20 h-20" aria-details={alt} />
		{:else}
			<ProgressRadial />
		{/if}
	</div>
</div>
