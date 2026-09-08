<script lang="ts">
	import { onMount, tick } from 'svelte';

	import { afterNavigate } from '$app/navigation';

	import type { MediaPreview } from './media-preview';
	import { mediaPreview } from './media-preview';

	export let trailerFrame: string | null = null;
	export let trailerClose: string | null = null;
	let dialog: HTMLDialogElement;
	let selected: MediaPreview | null = null;
	let trigger: HTMLAnchorElement | null = null;

	function close() {
		if (dialog?.open) dialog.close();
		selected = null;
		trigger?.focus({ preventScroll: true });
		trigger = null;
	}

	async function activate(event: MouseEvent) {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.ctrlKey ||
			event.metaKey ||
			event.shiftKey ||
			event.altKey ||
			!(event.target instanceof Element)
		)
			return;
		const link = event.target.closest<HTMLAnchorElement>('a[data-cip-media]');
		if (!link || link.hasAttribute('download')) return;
		const media = mediaPreview(
			link.dataset.cipMedia,
			link.href,
			window.location.origin,
		);
		if (!media) return;
		event.preventDefault();
		trigger = link;
		selected = media;
		await tick();
		if (selected && !dialog.open) dialog.showModal();
	}

	function backdrop(event: MouseEvent) {
		if (event.target === dialog) close();
	}

	afterNavigate(close);
	onMount(() => {
		const shell = dialog.closest('.theme-cip-slender');
		const click = (event: Event) => void activate(event as MouseEvent);
		shell?.addEventListener('click', click);
		dialog.addEventListener('click', backdrop);
		return () => {
			shell?.removeEventListener('click', click);
			dialog.removeEventListener('click', backdrop);
		};
	});
</script>

<dialog
	class="cip-media-dialog"
	class:cip-media-dialog--video={selected?.kind === 'video'}
	bind:this={dialog}
	aria-label={selected?.label ?? 'Media preview'}
	on:cancel|preventDefault={close}
	on:close={close}>
	{#if selected?.kind === 'image'}
		<div class="cip-media-dialog__image">
			<button
				type="button"
				class="cip-media-dialog__image-close"
				aria-label="Close popup with large image"
				on:click={close}>X</button>
			<img src={selected.src} alt="Enlarged news illustration" />
		</div>
	{:else if selected?.kind === 'video'}
		<div
			class="cip-media-dialog__video"
			style:background-image={trailerFrame
				? `url("${trailerFrame}")`
				: undefined}>
			<button
				type="button"
				class="cip-media-dialog__video-close"
				aria-label="Close Tibia trailer"
				on:click={close}>
				{#if trailerClose}<img src={trailerClose} alt="" />{/if}
				<span>X</span>
			</button>
			<iframe
				src={selected.src}
				title={selected.label}
				allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; gyroscope"
				allowfullscreen>
			</iframe>
		</div>
	{/if}
</dialog>

<style>
	:global(.theme-cip-slender) .cip-media-dialog {
		position: fixed;
		inset: 0;
		box-sizing: border-box;
		width: 100vw;
		height: 100vh;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		color: black;
		font:
			16px Verdana,
			Arial,
			'Times New Roman',
			sans-serif;
		overflow: auto;
	}
	:global(.theme-cip-slender) .cip-media-dialog[open] {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	:global(.theme-cip-slender) .cip-media-dialog::backdrop {
		background: rgb(0 0 0 / 0.75);
	}
	:global(.theme-cip-slender) .cip-media-dialog__image {
		position: relative;
		margin: 0 25px;
		line-height: normal;
	}
	:global(.theme-cip-slender) .cip-media-dialog__image img {
		display: inline;
		width: auto;
		height: auto;
		max-width: calc(100vw - 32px);
		max-height: calc(100vh - 32px);
		margin: 0;
		border: 0;
		vertical-align: baseline;
	}
	:global(.theme-cip-slender) .cip-media-dialog__image-close {
		position: absolute;
		display: block;
		top: -12px;
		right: -12px;
		box-sizing: border-box;
		width: 25px;
		height: 25px;
		margin: 0;
		padding: 1px 6px;
		border: 1px solid white;
		border-radius: 13px;
		background: black;
		color: white;
		font:
			13.3333px Arial,
			sans-serif;
		cursor: pointer;
	}
	:global(.theme-cip-slender) .cip-media-dialog--video[open] {
		align-items: flex-start;
		width: 100%;
		padding-top: 160px;
	}
	:global(.theme-cip-slender) .cip-media-dialog__video {
		position: relative;
		width: 775px;
		max-width: calc(100% - 48px);
		aspect-ratio: 775 / 447;
		background-position: center;
		background-size: 100% 100%;
		background-repeat: no-repeat;
	}
	:global(.theme-cip-slender) .cip-media-dialog__video iframe {
		position: absolute;
		top: calc(100% * 13 / 447);
		left: calc(100% * 12.5 / 775);
		width: calc(100% * 750 / 775);
		height: calc(100% * 421 / 447);
		border: 0;
	}
	:global(.theme-cip-slender) .cip-media-dialog__video-close {
		position: absolute;
		z-index: 1;
		display: block;
		top: -15px;
		right: -15px;
		width: 45px;
		height: 48px;
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		color: rgb(218 118 30);
		font:
			16px Verdana,
			Arial,
			'Times New Roman',
			sans-serif;
		cursor: pointer;
	}
	:global(.theme-cip-slender) .cip-media-dialog__video-close img {
		display: inline;
		width: 45px;
		height: 45px;
		max-width: none;
		vertical-align: baseline;
	}
	:global(.theme-cip-slender) .cip-media-dialog__video-close span {
		position: absolute;
		top: 12px;
		left: 17px;
	}
	@media (max-width: 800px), (max-height: 650px) {
		:global(.theme-cip-slender) .cip-media-dialog--video[open] {
			padding-top: 40px;
		}
	}
</style>
