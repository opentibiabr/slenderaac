<script lang="ts">
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import DocumentContent from '$lib/components/ui/DocumentContent.svelte';
	import { serverText } from '$lib/site-identity';

	import type { PageData } from './$types';

	export let data: PageData;
	$: identity = { name: $page.data.serverName, website: $page.url.origin };
	$: fileSize = data.archive ? formatFileSize(data.archive.size) : '';
	$: modified = data.archive
		? new Intl.DateTimeFormat('en-GB', {
				dateStyle: 'medium',
				timeZone: 'UTC',
			}).format(new Date(data.archive.modified))
		: '';

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024)
			return `${new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(bytes / 1024)} KB`;
		return `${new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(bytes / 1024 / 1024)} MB`;
	}
</script>

<svelte:head><title>{data.title}</title></svelte:head>

<section class="fankit-page">
	{#if data.content}<DocumentContent
			content={serverText(data.content, identity)} />
	{:else}<p>
			Download the official {identity.name} artwork package for community projects
			and fan creations.
		</p>{/if}

	<div class="fankit-page__download">
		{#if data.archive}<h2>Artwork package</h2>
			<p>
				<strong>{data.archive.name}</strong><br />
				{fileSize} · Updated {modified}
			</p>
			<Button href="/fankit/download">Download Fankit</Button>
		{:else}<h2>Package unavailable</h2>
			<p>
				The server operator has not published an artwork package yet. Please try
				again later.
			</p>{/if}
	</div>
</section>

<style>
	.fankit-page > :global(.document-content),
	.fankit-page > p {
		margin: 0 0 20px;
	}
	.fankit-page__download {
		padding: 16px;
		border: 1px solid rgb(var(--color-surface-500));
		border-radius: 4px;
		background: rgb(var(--color-surface-600) / 0.3);
	}
	.fankit-page__download h2 {
		margin: 0 0 8px;
		font-size: 1.125rem;
		font-weight: 700;
	}
	.fankit-page__download p {
		margin: 0 0 14px;
	}
	:global(.layout-surface-ornate) .fankit-page {
		font:
			12px Verdana,
			Arial,
			sans-serif;
	}
	:global(.layout-surface-ornate) .fankit-page__download {
		padding: 10px;
		border: 1px solid #793d03;
		border-radius: 0;
		background: #d4c0a1;
		box-shadow:
			inset 1px 1px #f1e0c6,
			inset -1px -1px #8f6f49;
	}
	:global(.layout-surface-ornate) .fankit-page__download h2 {
		font:
			bold 12px Verdana,
			Arial,
			sans-serif;
	}
</style>
