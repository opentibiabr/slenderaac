<script lang="ts">
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import HelpArticle from '$lib/components/ui/HelpArticle.svelte';
	import HelpLinks from '$lib/components/ui/HelpLinks.svelte';
	import { helpTopics, isHelpTopic } from '$lib/help';
	import { serverText } from '$lib/site-identity';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;
	$: classic = $page.data.selectedTheme === 'classic';
	$: help = data.help;
	$: topic = help.entry?.topic || help.topic;
	$: title = (text: string) =>
		serverText(text, { name: $page.data.serverName, website: '' });
	const href = (query = '') =>
		themePreviewHref($page.url, '/support/get-help' + query);
	const pageHref = (number: number) => {
		const query = new URLSearchParams({
			q: help.query,
			topic: help.topic,
			page: String(number),
		});
		return href('?' + query.toString());
	};
	let broken: Record<string, boolean> = {};
</script>

<div class="help-page" class:classic>
	<form
		class="help-search"
		action="/support/get-help"
		method="GET"
		role="search">
		{#if $page.url.searchParams.has('themePreview')}<input
				type="hidden"
				name="themePreview"
				value={$page.url.searchParams.get('themePreview')} />{/if}
		<input
			aria-label="Search the FAQ"
			placeholder="Search the FAQ"
			type="search"
			name="q"
			value={help.query}
			maxlength="50"
			class:input={!classic}
			style:background-size="20px"
			style:background-position="2px 2px"
			style:background-repeat="no-repeat"
			style:background-image={data.artwork.helpSearch
				? `url("${data.artwork.helpSearch}")`
				: undefined} />
		<Button type="submit">Search</Button>
	</form>
	{#if help.entry || help.listing}
		<nav class="help-breadcrumb" aria-label="FAQ">
			<a href={href()}>FAQ Overview</a>{#if isHelpTopic(topic)}
				<span>→</span>
				<a href={href('?topic=' + topic)}>{title(helpTopics[topic])}</a>{/if}
		</nav>
		<hr />
		{#if help.entry}
			<h3 class="help-answer-title">{title(help.entry.title)}</h3>
			<hr />
			{#key help.entry.slug}<HelpArticle
					slug={help.entry.slug}
					content={help.entry.content} />{/key}
		{:else}
			<h1>{help.query ? 'Search Results' : 'Specify Your Problem'}</h1>
			{#if help.query}<p>
					{help.total} result{help.total === 1 ? '' : 's'} for “{help.query}”.
				</p>{/if}
			{#if help.entries.length}<ol class="help-results">
					{#each help.entries as entry}<li>
							<a href={href('?article=' + entry.slug)}>{title(entry.title)}</a>
						</li>{/each}
				</ol>
			{:else}<p>
					No matching articles. Try different words or another category.
				</p>{/if}
			{#if help.pages > 1}<nav class="help-pages" aria-label="Search pages">
					{#if help.page > 1}<Button href={pageHref(help.page - 1)}
							>Previous</Button
						>{/if}<span>Page {help.page} of {help.pages}</span
					>{#if help.page < help.pages}<Button href={pageHref(help.page + 1)}
							>Next</Button
						>{/if}
				</nav>{/if}
		{/if}
	{:else}
		<nav class="help-topics" aria-label="Help topics">
			{#each Object.entries(helpTopics) as [key, label]}
				<a class="help-topic" href={href('?topic=' + key)}>
					<span class="help-icon"
						>{#if data.artwork[`helpTopic-${key}-idle`] && !broken[key]}<img
								src={data.artwork[`helpTopic-${key}-idle`]}
								alt=""
								width="65"
								height="65"
								on:error={() =>
									(broken = {
										...broken,
										[key]: true,
									})} />{#if data.artwork[`helpTopic-${key}-over`]}<img
									class="hover-icon"
									src={data.artwork[`helpTopic-${key}-over`]}
									alt=""
									width="65"
									height="65" />{/if}{:else}<span
								aria-hidden="true"
								class="icon-fallback">?</span
							>{/if}</span
					><span class="help-label">{title(label)}</span></a>
			{/each}
		</nav>
		<div class="help-permanent">
			<HelpLinks title="Most Viewed FAQ" entries={help.viewed} /><HelpLinks
				title="Hot Topics"
				entries={help.featured} />
		</div>
	{/if}
</div>

<style>
	.help-search {
		display: flex;
		gap: 5px;
		margin-bottom: 25px;
	}
	.help-search input {
		flex: 1;
		min-width: 0;
		background-repeat: no-repeat;
		background-size: 20px;
		background-position: 3px 3px;
		padding-left: 25px;
	}
	.help-topics {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		row-gap: 40px;
		margin: 25px 0 50px;
	}
	.help-topic {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		padding: 5px;
		text-align: center;
	}
	.help-icon {
		position: relative;
		display: block;
		width: 65px;
		height: 65px;
	}
	.help-icon img {
		image-rendering: auto;
		width: 65px;
		height: 65px;
		max-width: none;
	}
	.hover-icon {
		position: absolute;
		inset: 0;
		opacity: 0;
	}
	.help-topic:hover .hover-icon,
	.help-topic:focus-visible .hover-icon {
		opacity: 1;
	}
	.icon-fallback {
		display: grid;
		place-items: center;
		height: 65px;
		font-size: 32px;
		border: 1px solid currentColor;
		border-radius: 50%;
	}
	.help-permanent {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	.help-breadcrumb {
		margin: 0 0 15px;
	}
	.help-breadcrumb span {
		padding: 0 4px;
	}
	h1 {
		font-size: 1.5rem;
		font-weight: bold;
		margin: 16px 0;
	}
	.help-results {
		list-style: decimal;
		padding-left: 40px;
	}
	.help-results li {
		line-height: 1.75;
	}
	.help-pages {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin-top: 20px;
	}
	.classic {
		font:
			12px Verdana,
			Arial,
			sans-serif;
	}
	.classic .help-search {
		height: 16px;
		margin-bottom: 25px;
		padding-right: 5px;
	}
	.classic .help-search input {
		appearance: textfield;
		height: 25px;
		padding: 1px 2px 1px 26px;
		border: 1px solid #767676;
		background-color: white;
		color: black;
		border-radius: 0;
		font:
			13.333px Arial,
			sans-serif;
	}
	.classic .help-topics {
		row-gap: 50px;
		grid-auto-rows: 78px;
		margin: 25px 0 50px;
		height: 256px;
	}
	.classic .help-topic {
		position: relative;
		display: block;
		font-weight: normal;
	}
	.classic .help-icon {
		margin: auto;
	}
	.classic .help-label {
		position: absolute;
		top: 75px;
		left: calc(50% + 2.5px);
		height: 30px;
		color: #5a2800;
		transform: translateX(-50%);
		padding: 5px;
		width: 150px;
		font:
			14.667px Verdana,
			Arial,
			sans-serif;
	}
	.classic .help-permanent {
		margin-top: -40px;
	}
	.classic .help-breadcrumb {
		padding-top: 0;
		margin: 0 0 15px;
	}
	.classic hr {
		border: 0;
		border-top: 2px groove #eee;
		margin: 6px 0;
	}
	.classic h1 {
		font:
			bold 24px Verdana,
			Arial,
			sans-serif;
		margin: 16.08px 0;
	}
	.classic .help-results {
		font:
			15px/26.25px Verdana,
			Arial,
			sans-serif;
		margin: 15px 0;
	}
	@media (max-width: 600px) {
		.help-permanent {
			grid-template-columns: 1fr;
		}
		.help-topics {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.classic .help-topics {
			height: auto;
			padding-bottom: 35px;
		}
		.classic .help-permanent {
			margin-top: 0;
		}
		.help-pages {
			flex-wrap: wrap;
		}
	}
	.classic .help-answer-title {
		font:
			bold 14.04px Verdana,
			Arial,
			sans-serif;
		margin: 14.04px 0;
	}
</style>
