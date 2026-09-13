<script lang="ts">
	import { page } from '$app/stores';

	import { themePreviewHref } from '$lib/themes/preview';

	export let back: string;
	export let previous: string | null = null;
	export let next: string | null = null;
	export let label = 'Catalog navigation';
	export let artwork: Record<string, string | undefined> | null = null;
	$: assets = artwork ?? $page.data.themeAssets;
</script>

<nav class="catalog-navigation" aria-label={label}>
	<span
		>{#if previous}<a href={themePreviewHref($page.url, previous)}
				>{#if assets?.catalogPrevious}<img
						src={assets.catalogPrevious}
						width="15"
						height="11"
						alt="" />{/if} previous</a
			>{/if}</span>
	<a class="catalog-navigation__back" href={themePreviewHref($page.url, back)}
		>{#if assets?.catalogBack}<img
				src={assets.catalogBack}
				width="11"
				height="15"
				alt="" />{/if} back</a>
	<span
		>{#if next}<a href={themePreviewHref($page.url, next)}
				>next {#if assets?.catalogNext}<img
						src={assets.catalogNext}
						width="15"
						height="11"
						alt="" />{/if}</a
			>{/if}</span>
</nav>

<style>
	.catalog-navigation {
		position: relative;
		display: flex;
		justify-content: space-between;
		min-height: 15px;
	}
	.catalog-navigation__back {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}
	img {
		display: inline;
		vertical-align: baseline;
	}
	:global(.theme-classic .catalog-navigation img[width='15']) {
		width: 15px;
		height: 11px;
	}
	:global(.theme-classic .catalog-navigation img[width='11']) {
		width: 11px;
		height: 15px;
	}
</style>
