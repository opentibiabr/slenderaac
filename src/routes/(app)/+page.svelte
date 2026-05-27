<script lang="ts">
	import { faCalendar } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';

	import Markdoc from '$lib/components/markdoc/Markdoc.svelte';
	import { formatDate } from '$lib/utils';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="w-full">
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

	{#each data.articles as article, i}
		<header
			class="card !variant-filled-secondary p-1 px-4 text-md -mx-2 flex flex-row gap-2 items-center justify-between">
			<span class="flex flex-row gap-2 items-center">
				<Fa icon={faCalendar} size="xs" />
				<span class="text-sm text-secondary-50"
					>{formatDate(article.created_at)}</span>
				<strong>{article.title}</strong>
			</span>
			<em class="text-sm">
				{$_('published-by')}
				<a href="/characters/{article.author.name}" class="text-secondary-200">
					{article.author.name}
				</a>
			</em>
		</header>

		<Markdoc content={article.content} />

		{#if i < data.articles.length - 1}
			<hr class="divider" />
		{/if}
	{/each}
</div>
