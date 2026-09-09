<script lang="ts">
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	import { browser } from '$app/environment';

	import { outfitFrameData } from '$lib/outfit-animation';
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

	let controller: AbortController | null = null;
	let requestId = 0;
	let loading = false;
	let index = 0;
	let shownFor = 0;
	let renderedIndex = -1;
	let actualMount: boolean | null = null;
	$: hasMount = actualMount ?? Boolean(outfit?.lookmount || outfit?.mount);

	async function sourceChanged(outfit: Outfit) {
		controller?.abort();
		const current = ++requestId;
		frames = [];
		index = 0;
		renderedIndex = -1;
		shownFor = 0;
		actualMount = null;
		loading = false;
		if (!outfit?.looktype || !browser) return;
		controller = new AbortController();
		loading = true;
		try {
			const response = await fetch(
				outfitURL({
					...outfit,
					mount: outfit.mount ?? outfit.lookmount ?? 0,
					resize: true,
				}),
				{ signal: controller.signal },
			);
			if (!response.ok) return;
			const data: unknown = await response.json();
			const next = await Promise.all(
				outfitFrameData(data).map(async (frame) => {
					const image = new Image();
					image.src = frame.image;
					await image.decode();
					return { image, duration: frame.duration };
				}),
			);
			if (current !== requestId) return;
			frames = next;
			if (
				data &&
				typeof data === 'object' &&
				'mounted' in data &&
				typeof data.mounted === 'boolean'
			)
				actualMount = data.mounted;
		} catch {
			// A missing or failed optional portrait must not interrupt its parent page.
		} finally {
			if (current === requestId) loading = false;
		}
	}

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
			}
			if (renderedIndex === index) return;
			renderedIndex = index;
			const frame = frames[index];
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			context.drawImage(
				frame.image,
				0,
				0,
				frame.image.width,
				frame.image.height,
				0,
				0,
				context.canvas.width,
				context.canvas.height,
			);
		}, 50);
		return () => {
			controller?.abort();
			requestId++;
			clearInterval(interval);
		};
	});
</script>

<div class="relative w-12 h-12 {klass} overflow-visible">
	<slot />
	<div
		class="absolute {hasMount
			? '-left-7 -bottom-1'
			: '-left-10 bottom-1'} {innerClass}">
		{#if frames.length && outfit?.looktype > 0}
			<canvas
				bind:this={canvas}
				width={frames[0].image.naturalWidth}
				height={frames[0].image.naturalHeight}
				class="w-20 h-20"
				role="img"
				aria-label={alt} />
		{:else if loading}
			<ProgressRadial />
		{/if}
	</div>
</div>
