<script lang="ts">
	import { page } from '$app/stores';

	import Content from '$lib/components/information/Content.svelte';
	import Gallery from '$lib/components/information/Gallery.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head><title>{data.title}</title></svelte:head>

<article
	class="information-page"
	data-information-page={data.informationPage.id}>
	{#if data.informationPresentation}
		<Content nodes={data.informationPresentation.body} />
		{#if data.informationPresentation.gallery}
			<Gallery gallery={data.informationPresentation.gallery} />
		{/if}
	{:else}
		<p>{data.informationPage.summary}</p>
		<p>
			<a href={themePreviewHref($page.url, '/account/signup')}
				>Create account</a>
			·
			<a href={themePreviewHref($page.url, '/characters')}>Find a character</a>
		</p>
	{/if}
</article>

<style>
	.information-page {
		display: flow-root;
	}
	.information-page :global(p) {
		margin: 1em 0;
	}
	.information-page :global(img) {
		max-width: 100%;
		height: auto;
	}
	:global(.theme-cip-slender) .information-page {
		font:
			12px Verdana,
			Arial,
			'Times New Roman',
			sans-serif;
		color: rgb(90 40 0);
	}
	:global(.theme-cip-slender) .information-page :global(a) {
		color: rgb(0 66 148);
		font-weight: bold;
		text-decoration: none;
	}
	:global(.theme-cip-slender) .information-page :global(a:hover) {
		text-decoration: underline;
	}
	:global(.theme-cip-slender) .information-page :global(img) {
		display: inline;
		vertical-align: baseline;
		image-rendering: auto;
	}
	:global(.theme-cip-slender)
		.information-page
		:global(.ContentImageLeftFloat) {
		float: left;
		margin: 0 10px 10px 0;
	}
	:global(.theme-cip-slender)
		.information-page
		:global(.ContentImageRightFloat) {
		float: right;
		margin: 0 0 10px 10px;
	}
	:global(.theme-cip-slender) .information-page :global(h3) {
		font-size: 1.17em;
		font-weight: bold;
		margin: 1em 0;
	}
	:global(.theme-cip-slender) .information-page :global(.BulletPointList) {
		margin: 1em 0;
		padding-left: 20px;
		list-style: none;
	}
	:global(.theme-cip-slender) .information-page :global(.BulletPointList li) {
		margin-bottom: 5px;
		padding-left: 17px;
		text-indent: -17px;
	}
	:global(.theme-cip-slender)
		.information-page
		:global(.BulletPointList li > img) {
		width: 12px;
		height: 15px;
		margin-right: 5px;
		vertical-align: bottom;
	}
</style>
