<script lang="ts">
	import '$lib/components/information/manual.css';

	import { page } from '$app/stores';

	import Content from '$lib/components/information/Content.svelte';
	import Gallery from '$lib/components/information/Gallery.svelte';
	import LibraryBoosted from '$lib/components/information/LibraryBoosted.svelte';
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
	{#if data.libraryBoosted && !data.libraryDetail}
		<LibraryBoosted
			assets={data.themeAssets}
			boss={data.informationPage.id === 'boostablebosses'}
			boosted={data.libraryBoosted} />
	{/if}
	{#if data.informationPage.id === 'company'}
		<Organization />
	{:else if data.informationPage.id === 'server'}
		<ServerIntroduction />
	{:else if data.libraryDetail}
		<nav class="creature-navigation" aria-label="Creature navigation">
			<span
				>{#if data.libraryDetail.previous}<a
						href={themePreviewHref(
							$page.url,
							`${$page.url.pathname}?race=${data.libraryDetail.previous}`,
						)}>previous</a
					>{/if}</span>
			<a href={themePreviewHref($page.url, $page.url.pathname)}>back</a>
			<span
				>{#if data.libraryDetail.next}<a
						href={themePreviewHref(
							$page.url,
							`${$page.url.pathname}?race=${data.libraryDetail.next}`,
						)}>next</a
					>{/if}</span>
		</nav>
		<div class="creature-detail">
			<h2>{data.libraryDetail.entry.name}</h2>
			<img
				src={data.libraryDetail.entry.image}
				alt={data.libraryDetail.entry.name}
				width="64"
				height="64" />
			<p>
				Additional information about this creature has not been added to the
				library.
			</p>
		</div>
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
	.creature-navigation {
		display: flex;
		justify-content: space-between;
	}
	.creature-navigation > span {
		flex: 1;
	}
	.creature-navigation > span:last-child {
		text-align: right;
	}
	.creature-detail {
		margin-top: 25px;
	}
	.creature-detail h2 {
		float: right;
	}
	.creature-detail p {
		clear: both;
		padding-top: 20px;
	}
	.information-page :global(.CreatureCatalog) {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		text-align: center;
	}
	.information-page :global(.CreatureEntry) {
		width: 100px;
		height: 110px;
		margin: 0;
	}
	.information-page :global(.CreatureEntry img) {
		width: 64px;
		height: 64px;
	}
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
