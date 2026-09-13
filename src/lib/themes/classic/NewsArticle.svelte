<script lang="ts">
	import { page } from '$app/stores';

	import { serverText } from '$lib/site-identity';
	import { themePreviewHref } from '$lib/themes/preview';

	export let id: number | string;
	export let title: string;
	export let date: string;
	export let icon: string | null = null;
	export let commentHref: string | null = null;
	export let reference = false;
</script>

<article class="classic-news-article" id="news-{id}">
	<header class="classic-news-headline">
		{#if icon}<span class="classic-news-icon"><img src={icon} alt="" /></span
			>{/if}
		<div class="classic-news-date">{date.replaceAll(' ', '\u00a0')} -</div>
		<h2>
			{serverText(title, {
				name: $page.data.serverName,
				website: $page.url.origin,
			})}
		</h2>
	</header>
	<div class="classic-news-body" class:classic-news-body--reference={reference}>
		<slot />
	</div>
	{#if commentHref}
		<div class="classic-news-comment">
			<a href={themePreviewHref($page.url, commentHref)}
				>» Comment on this news</a>
		</div>
	{/if}
</article>

<style>
	.classic-news-article {
		margin-bottom: 15px;
		color: rgb(90 40 0);
		font:
			12px Verdana,
			Arial,
			sans-serif;
	}
	.classic-news-headline {
		position: relative;
		min-height: 32px;
		margin-bottom: 5px;
		border: 1px solid black;
		background: var(--classic-news-headline, none) 0 2px repeat;
		color: white;
	}
	.classic-news-icon {
		position: absolute;
		top: -1px;
		left: 5px;
		width: 32px;
		height: 32px;
		display: grid;
		place-items: center;
	}
	.classic-news-icon img {
		max-width: 32px;
		max-height: 32px;
		width: auto;
		height: auto;
	}
	.classic-news-date {
		float: left;
		width: fit-content;
		margin: 10px 4px 0 40px;
		font-size: 9.33333px;
	}
	h2 {
		margin: 2px 0 2px 7px;
		color: white;
		font-size: 13.33333px;
		font-weight: bold;
		line-height: 26px;
	}
	.classic-news-body {
		display: flow-root;
		padding: 0 10px;
		font-size: 13.33333px;
		line-height: normal;
		overflow-wrap: break-word;
	}
	.classic-news-body :global(.prose) {
		display: block;
		max-width: none;
		margin: 0;
		color: inherit;
		font: inherit;
	}
	.classic-news-body :global(p) {
		margin: 1em 0;
		padding: 0;
		color: inherit;
		font: inherit;
	}
	.classic-news-body :global(ul),
	.classic-news-body :global(ol) {
		margin: 1em 0;
		padding: 0 0 0 40px;
		color: inherit;
		font: inherit;
		list-style: disc;
	}
	.classic-news-body :global(ol) {
		list-style-type: decimal;
	}
	.classic-news-body :global(ul ul),
	.classic-news-body :global(ol ul) {
		margin-block: 0;
		list-style-type: circle;
	}
	.classic-news-body :global(ul ul ul) {
		list-style-type: square;
	}
	.classic-news-body :global(li) {
		margin: 0;
		padding: 0;
		color: inherit;
	}
	.classic-news-body :global(b),
	.classic-news-body :global(strong) {
		color: inherit;
		font-weight: bold;
	}
	.classic-news-body :global(a),
	.classic-news-comment a {
		color: rgb(0 66 148);
		font-weight: bold;
		text-decoration: none;
	}
	.classic-news-body :global(a:hover),
	.classic-news-comment a:hover {
		text-decoration: underline;
	}
	.classic-news-body :global(img) {
		display: inline;
		max-width: 100%;
		height: auto;
		margin: 0;
		border: 0;
		vertical-align: baseline;
	}
	.classic-news-body--reference :global(img[align='right']) {
		float: right;
	}
	.classic-news-body--reference :global(img[align='left']) {
		float: left;
	}
	.classic-news-body--reference :global(img[hspace='10']) {
		margin-inline: 10px;
	}
	.classic-news-body--reference :global(img[vspace='10']) {
		margin-block: 10px;
	}
	.classic-news-comment {
		padding-right: 10px;
		text-align: right;
		font-size: 13.33333px;
		line-height: normal;
	}
	@media (max-width: 600px) {
		.classic-news-body--reference :global(img[align='right']) {
			float: none;
			display: block;
			margin: 1em auto;
		}
		.classic-news-body--reference :global(img[align='left'][width]) {
			float: none;
			display: block;
			margin: 1em auto;
		}
	}
</style>
