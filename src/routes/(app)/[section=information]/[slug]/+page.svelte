<script lang="ts">
	import '$lib/components/information/manual.css';

	import { page } from '$app/stores';

	import Content from '$lib/components/information/Content.svelte';
	import CreatureLibrary from '$lib/components/information/CreatureLibrary.svelte';
	import Gallery from '$lib/components/information/Gallery.svelte';
	import Organization from '$lib/components/information/Organization.svelte';
	import ServerIntroduction from '$lib/components/information/ServerIntroduction.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head><title>{data.title}</title></svelte:head>

<article
	class="information-page"
	class:information-page--manual={data.informationPage.id === 'manual'}
	data-information-page={data.informationPage.id}>
	{#if data.informationPage.id === 'company'}
		<Organization />
	{:else if data.informationPage.id === 'server'}
		<ServerIntroduction />
	{:else if data.library}
		<CreatureLibrary
			{...data.library}
			boss={data.informationPage.id === 'boostablebosses'} />
	{:else if data.informationPage.id === 'screenshots'}
		{#if data.gallery?.items.length}
			<Gallery gallery={data.gallery} />
		{:else}
			<p>No screenshots have been published yet.</p>
		{/if}
	{:else if data.informationPresentation}
		<Content nodes={data.informationPresentation.body} />
		{#if data.informationPresentation.gallery}
			<Gallery gallery={data.informationPresentation.gallery} />
		{/if}
	{:else}
		<p>{data.informationPage.summary}</p>
		{#if data.informationPage.section !== 'library'}<p>
				<a href={themePreviewHref($page.url, '/account/signup')}
					>Create account</a>
				·
				<a href={themePreviewHref($page.url, '/characters')}
					>Find a character</a>
			</p>{/if}
	{/if}
</article>

<style>
	:global(.theme-classic) .information-page :global(.Bulletpoint) {
		margin: 20px 0 8px;
	}
	:global(.theme-classic) .information-page :global(.Bulletpoint img) {
		margin-right: 5px;
		vertical-align: bottom;
	}
	:global(.theme-classic)
		.information-page
		:global(.TableContent.CompactTable td) {
		padding: 2px 5px;
	}
	:global(.theme-classic)
		.information-page
		:global(.TableContent.ContactTable td) {
		padding: 10px 5px;
		border: 0;
	}
	:global(.theme-classic)
		.information-page
		:global(.TableContent td.LabelV150) {
		width: 150px;
		font-weight: bold;
		vertical-align: top;
		white-space: nowrap;
	}
	:global(.theme-classic) .information-page :global(.TableContent .LabelV td) {
		font-weight: bold;
		vertical-align: top;
		white-space: nowrap;
	}
	:global(.theme-classic) .information-page :global(.GreedyCell) {
		width: 100%;
	}
	:global(.theme-classic) .information-page :global(.NoWrap) {
		white-space: nowrap;
	}
	:global(.theme-classic) .information-page :global(.Alternate) {
		background: rgb(212 192 161);
	}
	:global(.theme-classic) .information-page :global(sup) {
		position: static;
		font-size: smaller;
		line-height: normal;
		vertical-align: super;
	}
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
	:global(.theme-classic) .information-page {
		font:
			12px Verdana,
			Arial,
			'Times New Roman',
			sans-serif;
		color: rgb(90 40 0);
	}
	:global(.theme-classic) .information-page :global(a) {
		color: rgb(0 66 148);
		font-weight: bold;
		text-decoration: none;
	}
	:global(.theme-classic) .information-page :global(a:hover) {
		text-decoration: underline;
	}
	:global(.theme-classic) .information-page :global(img) {
		display: inline;
		vertical-align: baseline;
		image-rendering: auto;
	}
	:global(.theme-classic) .information-page :global(img[align='top']) {
		vertical-align: top;
	}
	:global(.theme-classic) .information-page :global(.ContentImageLeftFloat) {
		float: left;
		margin: 0 10px 10px 0;
	}
	:global(.theme-classic) .information-page :global(.ContentImageRightFloat) {
		float: right;
		margin: 0 0 10px 10px;
	}
	:global(.theme-classic) .information-page :global(h3) {
		font-size: 1.17em;
		font-weight: bold;
		margin: 1em 0;
	}
	:global(.theme-classic) .information-page :global(.BulletPointList) {
		margin: 1em 0;
		padding-left: 20px;
		list-style: none;
	}
	:global(.theme-classic) .information-page :global(.BulletPointList li) {
		margin-bottom: 5px;
		padding-left: 17px;
		text-indent: -17px;
	}
	:global(.theme-classic) .information-page :global(.BulletPointList li > img) {
		width: 12px;
		height: 15px;
		margin-right: 5px;
		vertical-align: bottom;
	}
	:global(.theme-classic) .information-page :global(h2) {
		font-size: 1.5em;
		font-weight: bold;
		margin: 0.83em 0;
	}
	:global(.theme-classic) .information-page :global(.SpacedParagraph) {
		margin: 20px 0;
	}
	:global(.theme-classic) .information-page :global(.TableContent) {
		width: 100%;
		border: 1px solid rgb(250 240 215);
		border-collapse: collapse;
		font:
			13.333333px Verdana,
			Arial,
			sans-serif;
	}
	:global(.theme-classic) .information-page :global(.TableContent th),
	:global(.theme-classic) .information-page :global(.TableContent td) {
		border: 1px solid rgb(250 240 215);
		padding: 5px;
		vertical-align: middle;
	}
	:global(.theme-classic) .information-page :global(.TableContent th) {
		white-space: nowrap;
		font-weight: bold;
		text-align: left;
		vertical-align: top;
		background: rgb(212 192 161);
	}
	:global(.theme-classic) .information-page :global(.ComparisonTable td) {
		padding: 20px 5px;
	}
	:global(.theme-classic) .information-page :global(.TableContent .Odd) {
		background: rgb(241 224 198);
	}
	:global(.theme-classic) .information-page :global(.TableContent .Even) {
		background: rgb(213 192 161);
	}
	:global(.theme-classic) .information-page :global(.TableContent .TextCenter) {
		text-align: center;
	}
	:global(.theme-classic) .information-page :global(.TextStrong) {
		font-weight: bold;
	}
	:global(.theme-classic) .information-page :global(.IconOffset) {
		position: relative;
		top: 3px;
		margin-left: 5px;
	}
</style>
