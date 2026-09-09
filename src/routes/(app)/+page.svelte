<script lang="ts">
	import { faCalendar } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import Markdoc from '$lib/components/markdoc/Markdoc.svelte';
	import NewsArticle from '$lib/themes/classic/NewsArticle.svelte';
	import ReferenceContent from '$lib/themes/classic/ReferenceContent.svelte';
	import { classicAsset } from '$lib/themes/classic/theme';
	import { themePreviewHref } from '$lib/themes/preview';
	import { formatDate } from '$lib/utils';

	import type { PageData } from './$types';

	export let data: PageData;
	$: isClassicTheme = $page.data.selectedTheme === 'classic';
	$: themeAssets = $page.data.themeAssets as
		| Record<string, string | undefined>
		| undefined;

	const classicNewsMonths = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];

	function formatClassicNewsDate(value: Date | string) {
		const date = value instanceof Date ? value : new Date(value);
		return `${classicNewsMonths[date.getUTCMonth()]} ${String(
			date.getUTCDate(),
		).padStart(2, '0')} ${date.getUTCFullYear()}`;
	}

	function characterHref(currentUrl: URL, name: string): string {
		return themePreviewHref(
			currentUrl,
			`/characters/${encodeURIComponent(name)}`,
		);
	}
</script>

<div class="w-full">
	{#if !isClassicTheme && data.tickers.length > 0}
		<section class="mb-4 space-y-1" aria-label={$_('news-ticker')}>
			<h2 class="h4 mb-2">{$_('news-ticker')}</h2>
			{#each data.tickers as ticker, index (ticker.id)}
				<details
					id="ticker-{ticker.id}"
					class="news-ticker card border border-surface-500 p-2"
					open={$page.url.searchParams.get('ticker') === ticker.id ||
						$page.url.searchParams.get('ticker') === String(index)}>
					<summary class="cursor-pointer">
						<time
							class="text-sm"
							datetime={new Date(ticker.created_at).toISOString()}
							>{formatDate(ticker.created_at)}</time>
						<strong>{ticker.title}</strong>
					</summary>
					<Markdoc content={ticker.content} />
				</details>
			{/each}
		</section>
	{/if}

	{#if data.articles.length === 0}
		<section class="news-empty">
			<header
				class="card !variant-filled-secondary p-1 px-4 text-md -mx-2 flex flex-row gap-2 items-center">
				<Fa icon={faCalendar} size="xs" />
				<strong>{$_('news-empty-title')}</strong>
			</header>
			<p>{$_('news-empty-message')}</p>
		</section>
	{/if}

	{#each data.articles as article, i (article.id)}
		{#if isClassicTheme}
			<NewsArticle
				id={article.id}
				title={article.title}
				date={formatClassicNewsDate(article.created_at)}
				icon={article.presentation?.icon ??
					classicAsset(themeAssets, 'newsHeadlineIcon')}
				commentHref={article.presentation?.commentHref ?? null}
				reference={!!article.presentation}>
				{#if article.presentation}
					<ReferenceContent nodes={article.presentation.body} />
				{:else}
					<Markdoc content={article.content} />
				{/if}
			</NewsArticle>
		{:else}
			<header
				id="news-{article.id}"
				class="card !variant-filled-secondary p-1 px-4 text-md -mx-2 flex flex-row gap-2 items-center justify-between">
				<span class="flex flex-row gap-2 items-center">
					<Fa icon={faCalendar} size="xs" />
					<span class="text-sm text-secondary-50"
						>{formatDate(article.created_at)}</span>
					<strong>{article.title}</strong>
				</span>
				<em class="text-sm">
					{$_('published-by')}
					<a
						href={characterHref($page.url, article.author.name)}
						class="text-secondary-200">
						{article.author.name}
					</a>
				</em>
			</header>

			{#if data.classicReference}
				<article class="prose classic-news-reference">
					<ReferenceContent nodes={data.classicReference.articles[i].body} />
				</article>
			{:else}
				<Markdoc content={article.content} />
			{/if}

			{#if i < data.articles.length - 1}
				<hr class="divider" />
			{/if}
		{/if}
	{/each}
</div>
