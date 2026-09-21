<script lang="ts">
	import { page } from '$app/stores';

	import DocumentContent from '$lib/components/ui/DocumentContent.svelte';
	import { romanNumeral } from '$lib/genesis';
	import { serverText } from '$lib/site-identity';

	import type { PageData } from './$types';

	export let data: PageData;
	$: identity = { name: $page.data.serverName, website: $page.url.origin };
	const href = (chapter: number) => `/library/genesis?page=${chapter}`;
</script>

<section class="genesis-page">
	{#if data.chapter}<h1>{serverText(data.chapter.title, identity)}</h1>
		<DocumentContent content={data.chapter.content} />
		{#if data.previous || data.next}<nav
				class="genesis-page__chapters"
				aria-label="Story chapters">
				{#if data.previous}<span class="genesis-page__previous"
						>Chapter {romanNumeral(data.page - 1)}:
						<a href={href(data.page - 1)}
							>{serverText(data.previous.title, identity)}</a
						></span
					>{/if}
				{#if data.next}<span class="genesis-page__next"
						>Chapter {romanNumeral(data.page + 1)}:
						<a href={href(data.page + 1)}
							>{serverText(data.next.title, identity)}</a
						></span
					>{/if}
			</nav>{/if}
	{:else}<p class="page-intro">
			The server operator has not published this world's story yet.
		</p>{/if}
</section>

<style>
	.genesis-page h1 {
		margin: 0 0 18px;
		font-size: 1.5rem;
		font-weight: 700;
	}
	.genesis-page__chapters {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
		margin-top: 24px;
	}
	.genesis-page__previous {
		grid-column: 1;
	}
	.genesis-page__next {
		grid-column: 2;
		text-align: right;
	}
	:global(.layout-surface-ornate) .genesis-page {
		font:
			13.333px Verdana,
			Arial,
			sans-serif;
	}
	:global(.layout-surface-ornate) .genesis-page h1 {
		margin: 0 0 14px;
		font:
			bold 20px Verdana,
			Arial,
			sans-serif;
	}
	:global(.layout-surface-ornate .genesis-page article.prose > p) {
		display: flow-root;
		margin: 0 0 14px;
		font:
			12px/15px Verdana,
			Arial,
			sans-serif;
	}
	:global(
		.layout-surface-ornate .genesis-page article.prose > p::first-letter
	) {
		float: left;
		margin: 1px 5px 0 0;
		color: rgb(105 12 7);
		font:
			38px/30px Georgia,
			'Times New Roman',
			serif;
	}
	:global(.layout-surface-ornate) .genesis-page__chapters {
		margin-top: 20px;
		font:
			12px Verdana,
			Arial,
			sans-serif;
	}
	@media (max-width: 640px) {
		.genesis-page__chapters {
			grid-template-columns: 1fr;
		}
		.genesis-page__previous,
		.genesis-page__next {
			grid-column: 1;
			text-align: left;
		}
	}
</style>
