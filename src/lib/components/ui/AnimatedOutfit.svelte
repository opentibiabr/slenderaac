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
	let frames: Frame[] = [];

	// Parent data can be replaced during navigation without changing the portrait.
	$: source = outfit?.looktype
		? outfitURL({
				looktype: outfit.looktype,
				lookaddons: outfit.lookaddons ?? 0,
				lookhead: outfit.lookhead ?? 0,
				lookbody: outfit.lookbody ?? 0,
				looklegs: outfit.looklegs ?? 0,
				lookfeet: outfit.lookfeet ?? 0,
				mount: outfit.mount ?? outfit.lookmount ?? 0,
			})
		: '';
	$: void sourceChanged(source);

	let controller: AbortController | null = null;
	let requestId = 0;
	let loading = false;
	let actualMount: boolean | null = null;
	$: hasMount = actualMount ?? Boolean(outfit?.lookmount || outfit?.mount);

	async function sourceChanged(source: string) {
		controller?.abort();
		const current = ++requestId;
		frames = [];
		actualMount = null;
		loading = false;
		if (!source || !browser) return;
		controller = new AbortController();
		loading = true;
		try {
			const response = await fetch(source, { signal: controller.signal });
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

	function playFrames(canvas: HTMLCanvasElement, sequence: Frame[]) {
		canvas.width = Math.max(...sequence.map(({ image }) => image.naturalWidth));
		canvas.height = Math.max(
			...sequence.map(({ image }) => image.naturalHeight),
		);
		const context = canvas.getContext('2d');
		if (!context) return;

		let shown = -1;
		const draw = (index: number) => {
			if (shown === index) return;
			const { image } = sequence[index];
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(
				image,
				canvas.width - image.naturalWidth,
				canvas.height - image.naturalHeight,
			);
			shown = index;
		};

		draw(0);
		if (sequence.length === 1) return;

		let duration = 0;
		const frameEnds = sequence.map((frame) => (duration += frame.duration));
		const start = performance.now();
		let timer = window.setTimeout(tick, frameEnds[0]);

		function tick() {
			const elapsed = (performance.now() - start) % duration;
			const index = frameEnds.findIndex((end) => end > elapsed);
			draw(index);
			timer = window.setTimeout(tick, Math.ceil(frameEnds[index] - elapsed));
		}

		return {
			destroy() {
				window.clearTimeout(timer);
			},
		};
	}

	onMount(() => () => {
		controller?.abort();
		requestId++;
	});
</script>

<div class="relative w-12 h-12 {klass} overflow-visible">
	<slot />
	{#if frames.length && outfit?.looktype > 0}
		<div
			role="img"
			aria-label={alt}
			class="absolute w-16 h-16 {hasMount
				? '-left-3 -bottom-1'
				: '-left-6 bottom-1'} {innerClass}">
			{#key frames}
				<canvas use:playFrames={frames} aria-hidden="true" />
			{/key}
		</div>
	{:else if loading}
		<div class="absolute inset-0 grid place-items-center" aria-hidden="true">
			<ProgressRadial width="w-6" />
		</div>
	{/if}
</div>

<style>
	canvas {
		position: absolute;
		right: 0;
		bottom: 0;
		max-width: none;
		image-rendering: auto;
	}
</style>
