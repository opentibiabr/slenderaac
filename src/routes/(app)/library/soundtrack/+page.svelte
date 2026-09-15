<script lang="ts">
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import DocumentContent from '$lib/components/ui/DocumentContent.svelte';
	import SoundtrackPlayer from '$lib/components/ui/SoundtrackPlayer.svelte';
	import { serverText } from '$lib/site-identity';

	import type { PageData } from './$types';

	export let data: PageData;
	let activeTrack: string | null = null;
	$: identity = { name: $page.data.serverName, website: $page.url.origin };
	$: archiveSize = data.catalog?.archive
		? fileSize(data.catalog.archive.size)
		: '';

	function fileSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		const formatter = new Intl.NumberFormat('en', {
			maximumFractionDigits: 1,
		});
		return bytes < 1024 * 1024
			? `${formatter.format(bytes / 1024)} KB`
			: `${formatter.format(bytes / 1024 / 1024)} MB`;
	}
</script>

<svelte:head><title>{data.title}</title></svelte:head>

<section class="soundtrack-page">
	{#if data.content}<DocumentContent
			content={serverText(data.content, identity)} />{/if}
	{#if data.catalog}
		{#if data.catalog.tracks.length > 0}<div class="soundtrack-page__tracks">
				{#each data.catalog.tracks as track (track.id)}<SoundtrackPlayer
						{...track}
						title={serverText(track.title, identity)}
						{activeTrack}
						audioHref={track.audioHref ? track.audioHref : null}
						imageHref={track.imageHref ? track.imageHref : null}
						on:requestplay={(event) => {
							activeTrack = event.detail.id;
						}} />{/each}
			</div>
		{:else}<p class="soundtrack-page__empty">
				The server operator has not published any tracks yet.
			</p>{/if}
		{#if data.catalog.archive}<section class="soundtrack-page__download">
				<h2>Download</h2>
				<p>{data.catalog.archive.name} · {archiveSize}</p>
				<Button href="/library/soundtrack/download">Whole Soundtrack</Button>
			</section>{/if}
	{:else}<p class="soundtrack-page__empty">
			The server soundtrack is not configured. Please try again later.
		</p>{/if}
</section>

<style>
	.soundtrack-page > :global(.document-content) {
		margin-bottom: 20px;
	}
	.soundtrack-page__download,
	.soundtrack-page__empty {
		width: min(100%, 520px);
		margin: 18px auto 0;
		padding: 14px;
		border: 1px solid rgb(var(--color-surface-500));
		background: rgb(var(--color-surface-700) / 0.35);
		text-align: center;
	}
	.soundtrack-page__download h2,
	.soundtrack-page__download p {
		margin: 0 0 10px;
	}
	:global(.layout-surface-ornate) .soundtrack-page {
		font:
			12px Verdana,
			Arial,
			sans-serif;
	}
	:global(.layout-surface-ornate) .soundtrack-page__download,
	:global(.layout-surface-ornate) .soundtrack-page__empty {
		width: min(100%, 380px);
		padding: 10px;
		border: 2px ridge #70634f;
		background: #d4c0a1;
	}
	:global(.layout-surface-ornate) .soundtrack-page__download h2 {
		font:
			bold 12px Verdana,
			Arial,
			sans-serif;
	}
</style>
