<script lang="ts">
	export let id: number | string;
	export let title: string;
	export let date: string;
	export let icon: string | null = null;
	export let commentHref: string | null = null;
	export let reference = false;
</script>

<article class="cip-news-article" id="news-{id}">
	<header class="cip-news-headline">
		{#if icon}<img class="cip-news-icon" src={icon} alt="" />{/if}
		<div class="cip-news-date">{date.replaceAll(' ', '\u00a0')} -</div>
		<h2>{title}</h2>
	</header>
	<div class="cip-news-body" class:cip-news-body--reference={reference}>
		<slot />
	</div>
	{#if commentHref}
		<div class="cip-news-comment">
			<a href={commentHref}>» Comment on this news</a>
		</div>
	{/if}
</article>

<style>
	.cip-news-article {
		margin-bottom: 15px;
		color: rgb(90 40 0);
		font:
			12px Verdana,
			Arial,
			sans-serif;
	}
	.cip-news-headline {
		position: relative;
		min-height: 32px;
		margin-bottom: 5px;
		border: 1px solid black;
		background: var(--cip-news-headline, none) 0 2px repeat;
		color: white;
	}
	.cip-news-icon {
		position: absolute;
		top: -1px;
		left: 5px;
		width: 32px;
		height: 32px;
	}
	.cip-news-date {
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
	.cip-news-body {
		display: flow-root;
		padding: 0 10px;
		font-size: 13.33333px;
		line-height: normal;
		overflow-wrap: break-word;
	}
	.cip-news-body :global(.prose) {
		display: block;
		max-width: none;
		margin: 0;
		color: inherit;
		font: inherit;
	}
	.cip-news-body :global(p) {
		margin: 1em 0;
		padding: 0;
		color: inherit;
		font: inherit;
	}
	.cip-news-body :global(ul),
	.cip-news-body :global(ol) {
		margin: 1em 0;
		padding: 0 0 0 40px;
		color: inherit;
		font: inherit;
		list-style: disc;
	}
	.cip-news-body :global(ol) {
		list-style-type: decimal;
	}
	.cip-news-body :global(ul ul),
	.cip-news-body :global(ol ul) {
		margin-block: 0;
		list-style-type: circle;
	}
	.cip-news-body :global(ul ul ul) {
		list-style-type: square;
	}
	.cip-news-body :global(li) {
		margin: 0;
		padding: 0;
		color: inherit;
	}
	.cip-news-body :global(b),
	.cip-news-body :global(strong) {
		color: inherit;
		font-weight: bold;
	}
	.cip-news-body :global(a),
	.cip-news-comment a {
		color: rgb(0 66 148);
		font-weight: bold;
		text-decoration: none;
	}
	.cip-news-body :global(a:hover),
	.cip-news-comment a:hover {
		text-decoration: underline;
	}
	.cip-news-body :global(img) {
		display: inline;
		max-width: 100%;
		height: auto;
		margin: 0;
		border: 0;
		vertical-align: baseline;
	}
	.cip-news-body--reference :global(img[align='right']) {
		float: right;
	}
	.cip-news-body--reference :global(img[align='left']) {
		float: left;
	}
	.cip-news-body--reference :global(img[hspace='10']) {
		margin-inline: 10px;
	}
	.cip-news-body--reference :global(img[vspace='10']) {
		margin-block: 10px;
	}
	.cip-news-comment {
		padding-right: 10px;
		text-align: right;
		font-size: 13.33333px;
		line-height: normal;
	}
	@media (max-width: 600px) {
		.cip-news-body--reference :global(img[align='right']) {
			float: none;
			display: block;
			margin: 1em auto;
		}
		.cip-news-body--reference :global(img[align='left'][width]) {
			float: none;
			display: block;
			margin: 1em auto;
		}
	}
</style>
