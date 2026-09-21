<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';

	export let id: string;
	export let title: string;
	export let audioHref: string | null;
	export let imageHref: string | null;
	export let activeTrack: string | null;

	const dispatch = createEventDispatcher<{ requestplay: { id: string } }>();
	let audio: HTMLAudioElement | null = null;
	let playing = false;
	let loading = false;
	let failed = false;
	let imageFailed = false;
	let currentTime = 0;
	let duration = 0;
	let volume = 1;

	$: if (audio && activeTrack !== id && !audio.paused) audio.pause();

	function time(value: number): string {
		if (!Number.isFinite(value) || value < 0) return '0:00';
		const minutes = Math.floor(value / 60);
		const seconds = Math.floor(value % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	async function toggle() {
		if (!audio || !audioHref || failed) return;
		if (!audio.paused) {
			audio.pause();
			return;
		}
		dispatch('requestplay', { id });
		try {
			await audio.play();
		} catch {
			failed = true;
			loading = false;
		}
	}

	function seek(event: Event) {
		if (!audio) return;
		audio.currentTime = Number((event.currentTarget as HTMLInputElement).value);
	}

	function setVolume(event: Event) {
		volume = Number((event.currentTarget as HTMLInputElement).value);
		if (audio) audio.volume = volume;
	}

	onDestroy(() => {
		audio?.pause();
	});
</script>

<article class="soundtrack-player">
	<header>{title}</header>
	<div class="soundtrack-player__art">
		{#if imageHref && !imageFailed}<img
				src={imageHref}
				alt=""
				loading="lazy"
				on:error={() => {
					imageFailed = true;
				}} />
		{:else}<div class="soundtrack-player__placeholder" aria-hidden="true">
				♪
			</div>{/if}
		<button
			type="button"
			class="soundtrack-player__toggle"
			disabled={!audioHref || failed}
			aria-label={playing ? `Pause ${title}` : `Play ${title}`}
			on:click={toggle}>
			<span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
		</button>
	</div>
	<div class="soundtrack-player__controls">
		<span class="soundtrack-player__time">{time(currentTime)}</span>
		<input
			type="range"
			min="0"
			max={duration || 0}
			step="0.1"
			value={currentTime}
			disabled={!audioHref || failed || duration === 0}
			aria-label={`Position in ${title}`}
			on:input={seek} />
		<span aria-hidden="true">♪</span>
		<input
			type="range"
			min="0"
			max="1"
			step="0.05"
			value={volume}
			disabled={!audioHref || failed}
			aria-label={`Volume for ${title}`}
			on:input={setVolume} />
	</div>
	{#if audioHref}<audio
			bind:this={audio}
			src={audioHref}
			preload="metadata"
			on:play={() => {
				playing = true;
				loading = false;
				dispatch('requestplay', { id });
			}}
			on:pause={() => (playing = false)}
			on:waiting={() => (loading = true)}
			on:canplay={() => (loading = false)}
			on:timeupdate={() => (currentTime = audio?.currentTime ?? 0)}
			on:durationchange={() => (duration = audio?.duration ?? 0)}
			on:error={() => {
				failed = true;
				loading = false;
			}} />{/if}
	<p class="soundtrack-player__status" aria-live="polite">
		{#if !audioHref}Track unavailable{:else if failed}Track could not be loaded{:else if loading}Loading…{/if}
	</p>
</article>

<style>
	.soundtrack-player {
		width: min(100%, 520px);
		margin: 0 auto 18px;
		border: 1px solid rgb(var(--color-surface-500));
		background: rgb(var(--color-surface-700) / 0.35);
	}
	.soundtrack-player header {
		padding: 7px 10px;
		font-weight: 700;
		text-align: center;
		background: rgb(var(--color-surface-700));
	}
	.soundtrack-player__art {
		position: relative;
		aspect-ratio: 19 / 8;
		background: rgb(var(--color-surface-800));
	}
	.soundtrack-player__art img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.soundtrack-player__placeholder {
		display: grid;
		width: 100%;
		height: 100%;
		place-items: center;
		font-size: 4rem;
		opacity: 0.45;
	}
	.soundtrack-player__toggle {
		position: absolute;
		bottom: -18px;
		left: 50%;
		z-index: 1;
		display: grid;
		width: 42px;
		height: 42px;
		padding: 0;
		place-items: center;
		border: 2px solid #d6b028;
		border-radius: 50%;
		color: #ffe678;
		background: #2412c9;
		box-shadow: 0 1px 3px #000;
		cursor: pointer;
	}
	.soundtrack-player__toggle:disabled {
		filter: grayscale(1);
		cursor: not-allowed;
	}
	.soundtrack-player__controls {
		display: grid;
		grid-template-columns: 42px minmax(80px, 1fr) auto minmax(55px, 0.3fr);
		gap: 5px;
		align-items: center;
		min-height: 28px;
		padding: 3px 6px;
		background: rgb(var(--color-surface-800));
	}
	.soundtrack-player__controls input {
		min-width: 0;
	}
	.soundtrack-player__time {
		font-variant-numeric: tabular-nums;
	}
	.soundtrack-player audio {
		display: none;
	}
	.soundtrack-player__status {
		min-height: 0;
		margin: 0;
		padding: 0 6px;
		font-size: 0.75rem;
		color: rgb(var(--color-error-300));
		background: rgb(var(--color-surface-800));
	}
	.soundtrack-player__status:empty {
		display: none;
	}
	:global(.layout-surface-ornate) .soundtrack-player {
		width: min(100%, 380px);
		margin-bottom: 16px;
		border: 2px ridge #70634f;
		background: #302c28;
		font:
			12px Verdana,
			Arial,
			sans-serif;
	}
	:global(.layout-surface-ornate) .soundtrack-player header {
		padding: 5px 8px;
		color: #fff;
		background: #4f463d;
	}
	:global(.layout-surface-ornate) .soundtrack-player__art {
		aspect-ratio: 95 / 41;
	}
	:global(.layout-surface-ornate) .soundtrack-player__controls {
		min-height: 24px;
		padding: 2px 5px;
		color: #d6b85a;
		background: #3b3b37;
	}
	:global(.layout-surface-ornate) .soundtrack-player__status {
		color: #f0c060;
		background: #3b3b37;
	}
</style>
