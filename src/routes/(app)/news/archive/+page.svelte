<script lang="ts">
	import { page } from '$app/stores';

	import TableFrame from '$lib/components/news/TableFrame.svelte';
	import TableSurface from '$lib/components/news/TableSurface.svelte';
	import { cipAsset } from '$lib/themes/cip-slender/theme';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;
	$: isCipTheme = $page.data.selectedTheme === 'cip-slender';
	let formUrl = '';
	let selectedTypes: string[] = [];
	let selectedCategories: string[] = [];
	$: if (formUrl !== $page.url.href) {
		formUrl = $page.url.href;
		selectedTypes = [...data.form.types];
		selectedCategories = [...data.form.categories];
	}

	const days = Array.from({ length: 31 }, (_, index) => index + 1);
	const months = Array.from({ length: 12 }, (_, index) => index + 1);
	const typeOptions = [
		{ key: 'ticker', label: 'News Ticker' },
		{ key: 'article', label: 'Featured Article' },
		{ key: 'news', label: 'News' },
	] as const;
	const categoryOptionDefs = [
		{ key: 'cipsoft', label: 'CipSoft', iconKey: 'newsArchiveIconCipsoft' },
		{
			key: 'community',
			label: 'Community',
			iconKey: 'newsArchiveIconCommunity',
		},
		{
			key: 'development',
			label: 'Development',
			iconKey: 'newsArchiveIconDevelopment',
		},
		{ key: 'support', label: 'Support', iconKey: 'newsArchiveIconSupport' },
		{
			key: 'technical',
			label: 'Technical Issues',
			iconKey: 'newsArchiveIconTechnical',
		},
	] as const;

	$: previewTheme = $page.url.searchParams.get('themePreview');
	$: themeAssets = $page.data.themeAssets as
		| Record<string, string | undefined>
		| null
		| undefined;
	$: archiveButtonBackground =
		cipAsset(themeAssets, 'newsArchiveButtonBackground') ??
		cipAsset(themeAssets, 'smallButtonBackground');
	$: archiveStyle = archiveButtonBackground
		? `--cip-news-archive-button: url("${archiveButtonBackground}")`
		: '';
	$: categoryOptions = categoryOptionDefs.map((option) => ({
		...option,
		icon: cipAsset(themeAssets, option.iconKey),
	}));

	function formatCipDate(value: Date | string) {
		const date = value instanceof Date ? value : new Date(value);
		return `${String(date.getUTCDate()).padStart(2, '0')}.${String(
			date.getUTCMonth() + 1,
		).padStart(2, '0')}.${date.getUTCFullYear()}`;
	}

	function newsHref(currentUrl: URL, articleId: string, type: string) {
		const nextUrl = new URL(
			themePreviewHref(currentUrl, '/'),
			currentUrl.origin,
		);
		if (type === 'ticker') {
			const index = articleId.startsWith('cip-ticker-')
				? articleId.slice('cip-ticker-'.length)
				: articleId;
			nextUrl.searchParams.set('ticker', index);
		} else {
			nextUrl.searchParams.set('news', articleId);
			nextUrl.hash = `news-${articleId}`;
		}

		return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
	}
</script>

<div
	class="news-archive w-full"
	class:news-archive--default={!isCipTheme}
	style={archiveStyle}>
	<form class="news-archive__form" method="get" action="/news/archive">
		{#if previewTheme}
			<input type="hidden" name="themePreview" value={previewTheme} />
			{#each ['cipReference', 'cipGrid', 'cipDemo'] as key}
				{#if $page.url.searchParams.has(key)}<input
						type="hidden"
						name={key}
						value={$page.url.searchParams.get(key)} />{/if}
			{/each}
		{/if}
		<input type="hidden" name="archive" value="1" />

		<TableFrame assets={themeAssets} minWidth={698} minHeight={181}>
			<span slot="caption">News Archive Search</span>
			<div class="news-archive__inner">
				<TableSurface assets={themeAssets} width="calc(100% - 13px)">
					<div
						class="news-archive__grid"
						role="group"
						aria-label="News Archive Search">
						<section class="news-archive__column news-archive__column--time">
							<h2>Time Period</h2>
							<div
								class="news-archive__date-grid news-archive__date-grid--labels">
								<span></span>
								<span>Day:</span>
								<span>Month:</span>
								<span>Year:</span>
							</div>
							<div class="news-archive__date-grid">
								<label for="filter-begin-day">From:</label>
								<select id="filter-begin-day" name="filter_begin_day">
									{#each days as day}
										<option value={day} selected={day === data.form.fromDay}
											>{day}</option>
									{/each}
								</select>
								<select aria-label="From month" name="filter_begin_month">
									{#each months as month}
										<option
											value={month}
											selected={month === data.form.fromMonth}>
											{month}
										</option>
									{/each}
								</select>
								<select
									aria-label="From year"
									name="filter_begin_year"
									class="year">
									{#each data.years as year}
										<option value={year} selected={year === data.form.fromYear}>
											{year}
										</option>
									{/each}
								</select>
							</div>

							<div class="news-archive__spacer" aria-hidden="true"></div>

							<div
								class="news-archive__date-grid news-archive__date-grid--labels">
								<span></span>
								<span>Day:</span>
								<span>Month:</span>
								<span>Year:</span>
							</div>
							<div class="news-archive__date-grid">
								<label for="filter-end-day">To:</label>
								<select id="filter-end-day" name="filter_end_day">
									{#each days as day}
										<option value={day} selected={day === data.form.toDay}
											>{day}</option>
									{/each}
								</select>
								<select aria-label="To month" name="filter_end_month">
									{#each months as month}
										<option
											value={month}
											selected={month === data.form.toMonth}>
											{month}
										</option>
									{/each}
								</select>
								<select
									aria-label="To year"
									name="filter_end_year"
									class="year">
									{#each data.years as year}
										<option value={year} selected={year === data.form.toYear}>
											{year}
										</option>
									{/each}
								</select>
							</div>
						</section>

						<section class="news-archive__column">
							<h2>Type</h2>
							<div class="news-archive__checks news-archive__checks--type">
								{#each typeOptions as option}
									<label>
										<input
											type="checkbox"
											name={`filter_${option.key}`}
											value={option.key}
											bind:group={selectedTypes} />
										<span>{option.label}</span>
									</label>
								{/each}
							</div>
						</section>

						<section class="news-archive__column">
							<h2>Category</h2>
							<div class="news-archive__checks">
								{#each categoryOptions as option}
									<label>
										<input
											type="checkbox"
											name={`filter_${option.key}`}
											value={option.key}
											bind:group={selectedCategories} />
										{#if option.icon}
											<img src={option.icon} alt="" aria-hidden="true" />
										{/if}
										<span>{option.label}</span>
									</label>
								{/each}
							</div>
						</section>
					</div>
				</TableSurface>
			</div>
		</TableFrame>

		<input class="news-archive__submit" type="submit" value="Submit" />
	</form>

	{#if data.submitted}
		<section class="news-archive__results" aria-live="polite">
			<TableFrame assets={themeAssets}>
				<span slot="caption">Search Results</span>
				<div class="news-archive__results-list">
					{#if data.notice}<p>{data.notice}</p>{/if}
					{#if data.articles.length > 0}
						{#each data.articles as article}
							<a href={newsHref($page.url, article.id, article.type)}>
								<span>{formatCipDate(article.created_at)}</span>
								<strong>{article.title}</strong>
							</a>
						{/each}
					{:else}
						<p>No news found for the selected search criteria.</p>
					{/if}
					{#if data.hasMore}<p>
							Showing the first 50 results. Narrow the time period to see more.
						</p>{/if}
				</div>
			</TableFrame>
		</section>
	{/if}
</div>

<style>
	.news-archive--default .news-archive__grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.news-archive--default .news-archive__column {
		flex: 1 1 8rem;
		min-width: 0;
	}

	.news-archive--default .news-archive__column--time {
		flex-basis: 15rem;
	}

	.news-archive--default h2 {
		margin-bottom: 0.5rem;
		font-weight: 700;
	}

	.news-archive--default .news-archive__date-grid {
		display: grid;
		grid-template-columns: 2.5rem repeat(2, minmax(0, 1fr)) minmax(
				4.75rem,
				1.3fr
			);
		align-items: center;
		gap: 0.375rem;
	}

	.news-archive--default .news-archive__date-grid--labels {
		margin-bottom: 0.25rem;
		font-size: 0.875rem;
	}

	.news-archive--default select {
		width: 100%;
		min-width: 0;
		padding: 0.375rem 1.5rem 0.375rem 0.375rem;
		border-radius: 0.25rem;
		color: rgb(var(--color-surface-900));
		background-color: rgb(var(--color-surface-100));
		font-size: 0.875rem;
	}

	.news-archive--default .news-archive__spacer {
		height: 0.75rem;
	}

	.news-archive--default .news-archive__checks {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.news-archive--default .news-archive__checks label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.news-archive--default .news-archive__submit {
		display: block;
		margin: 1rem auto;
		padding: 0.5rem 1.5rem;
		border-radius: 0.5rem;
		background: rgb(var(--color-primary-500));
		color: rgb(var(--on-primary));
		cursor: pointer;
	}

	.news-archive--default .news-archive__results-list {
		display: grid;
		gap: 0.75rem;
	}

	.news-archive--default .news-archive__results-list a {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1rem;
		text-decoration: underline;
		overflow-wrap: anywhere;
	}

	:global(.theme-cip-slender) .news-archive {
		width: calc(100% + 2px);
		margin: 0;
		color: rgb(90 40 0);
		font-family: Verdana, Arial, 'Times New Roman', sans-serif;
		font-size: 12px;
		line-height: normal;
	}

	:global(.theme-cip-slender) .news-archive__form {
		margin: 0;
	}

	:global(.theme-cip-slender) .news-archive__inner {
		box-sizing: border-box;
		width: calc(100% - 4px);
		height: 142px;
		margin: 5px 0 0 3px;
		padding: 3px 0 0 3px;
		border: 0;
		background: transparent;
		font-size: 10pt;
	}

	:global(.theme-cip-slender) .news-archive__grid {
		box-sizing: border-box;
		position: relative;
		display: grid;
		z-index: 1;
		grid-template-columns: 263px 274px 273px;
		width: 100%;
		height: 129px;
		min-height: 129px;
		border: 1px solid rgb(250 240 215);
	}

	:global(.theme-cip-slender .news-archive__inner > .cip-table-surface) {
		width: calc(100% - 6px) !important;
	}

	@media (max-width: 1280px) {
		:global(.theme-cip-slender) .news-archive__grid {
			--archive-time-column: max(247.5px, calc(100% * 0.324691358));
			grid-template-columns:
				var(--archive-time-column)
				calc((100% - var(--archive-time-column) + 1px) / 2) 1fr;
		}
	}

	:global(.theme-cip-slender) .news-archive__grid::after {
		position: absolute;
		top: 20px;
		left: 0;
		z-index: 2;
		width: 100%;
		height: 1px;
		background: rgb(248 239 216);
		content: '';
		pointer-events: none;
	}

	:global(.theme-cip-slender) .news-archive__column {
		box-sizing: border-box;
		min-width: 0;
		padding: 2px 5px;
		border-right: 1px solid rgb(250 240 215);
	}

	:global(.theme-cip-slender) .news-archive__column:last-child {
		border-right: 0;
	}

	:global(.theme-cip-slender) .news-archive__column--time {
		padding-left: 7px;
	}

	:global(.theme-cip-slender) .news-archive__column h2 {
		position: relative;
		top: -1px;
		height: 18px;
		margin: 0 0 5px;
		color: rgb(90 40 0);
		font-family: Verdana, Arial, 'Times New Roman', sans-serif;
		font-size: 10pt;
		font-weight: 700;
		line-height: 18px;
	}

	:global(.theme-cip-slender) .news-archive__column--time h2 {
		margin-bottom: 7px;
		transform: translateX(-2px);
	}

	:global(.theme-cip-slender) .news-archive__date-grid {
		display: grid;
		grid-template-columns: 52.5px 49px 59.5px 62px;
		align-items: center;
		height: 23px;
	}

	:global(.theme-cip-slender) .news-archive__date-grid--labels {
		height: 20px;
	}

	:global(.theme-cip-slender) .news-archive__date-grid span,
	:global(.theme-cip-slender) .news-archive__date-grid label {
		padding: 2px 5px;
		font-size: 10pt;
		line-height: 16px;
	}

	:global(.theme-cip-slender) .news-archive__date-grid--labels span {
		position: relative;
		top: -2px;
	}

	:global(.theme-cip-slender)
		.news-archive__date-grid
		label[for='filter-end-day'] {
		text-align: right;
		transform: translateX(-2px);
	}

	:global(.theme-cip-slender) .news-archive select {
		width: 37px;
		height: 19px;
		margin-left: 5px;
		appearance: auto;
		-webkit-appearance: menulist;
		padding: 0;
		border: 1px solid rgb(118 118 118);
		border-radius: 0;
		background: white;
		background-image: none;
		color: black;
		font:
			10pt Arial,
			sans-serif;
	}

	:global(.theme-cip-slender) .news-archive select.year {
		width: 52px;
	}

	:global(.theme-cip-slender) .news-archive__spacer {
		height: 10px;
	}

	:global(.theme-cip-slender) .news-archive__checks {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding-top: 3px;
	}

	:global(.theme-cip-slender) .news-archive__checks--type {
		padding-top: 22px;
	}

	:global(.theme-cip-slender) .news-archive__checks label {
		display: flex;
		align-items: center;
		height: 16px;
		color: rgb(90 40 0);
		font-size: 10pt;
		line-height: 16px;
		white-space: nowrap;
	}

	:global(.theme-cip-slender) .news-archive__checks label span {
		position: relative;
		top: 1.5px;
	}

	:global(.theme-cip-slender) .news-archive input[type='checkbox'] {
		width: 13px;
		height: 13px;
		margin: 3px 3px 3px 4px;
		padding: 0;
		appearance: auto;
		-webkit-appearance: checkbox;
		border: revert;
		background: revert;
		accent-color: auto;
	}

	:global(.theme-cip-slender) .news-archive__checks img {
		position: relative;
		top: 0.5px;
		width: 16px;
		height: 16px;
		margin-right: 4.6875px;
		object-fit: contain;
		image-rendering: pixelated;
	}

	:global(.theme-cip-slender) .news-archive__submit {
		position: relative;
		left: -1px;
		display: block;
		width: 135px;
		height: 25px;
		margin: 15px auto 0;
		padding: 0;
		border: 0;
		background: var(
				--cip-news-archive-button,
				linear-gradient(180deg, rgb(36 39 255), rgb(42 0 181))
			)
			center / 135px 25px no-repeat;
		color: rgb(255 209 140);
		font:
			12px Verdana,
			Arial,
			'Times New Roman',
			sans-serif;
		line-height: normal;
		text-align: center;
		text-shadow:
			-1px -1px 0 black,
			0 -1px 0 black,
			1px -1px 0 black,
			1px 0 0 black,
			1px 1px 0 black,
			0 1px 0 black,
			-1px 1px 0 black,
			-1px 0 0 black;
		cursor: pointer;
		image-rendering: pixelated;
	}

	:global(.theme-cip-slender) .news-archive__results {
		margin-top: 14px;
	}

	:global(.theme-cip-slender) .news-archive__results-list {
		padding: 8px 10px;
		border-top: 1px solid rgb(121 61 3);
		background: rgb(255 242 219);
		font-size: 12px;
	}

	:global(.theme-cip-slender) .news-archive__results-list a {
		display: block;
		padding: 2px 0;
		color: rgb(0 58 133);
		font-weight: 700;
		text-decoration: none;
	}

	:global(.theme-cip-slender) .news-archive__results-list a:hover {
		text-decoration: underline;
	}

	:global(.theme-cip-slender) .news-archive__results-list span {
		display: inline-block;
		min-width: 78px;
		color: rgb(90 40 0);
		font-weight: 400;
	}

	:global(.theme-cip-slender) .news-archive__results-list p {
		margin: 0;
		color: rgb(90 40 0);
	}
</style>
