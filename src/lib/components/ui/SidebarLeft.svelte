<script lang="ts">
	import {
		faBookBookmark,
		faGifts,
		faNewspaper,
		faPeopleArrows,
	} from '@fortawesome/free-solid-svg-icons';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import { informationPages, informationPath } from '$lib/information';
	import { featurePages } from '$lib/site-pages';
	import { themePreviewHref } from '$lib/themes/preview';

	import { PUBLIC_DOWNLOAD_URL } from '$env/static/public';

	export let isLoggedIn = false;
	export let staticPages: { title: string; slug: string }[];
	const routeSections: Record<string, string> = {
		'': 'news',
		news: 'news',
		characters: 'community',
		online: 'community',
		highscores: 'community',
		guilds: 'community',
		pages: 'library',
		shop: 'shop',
	};
	let openSections: Record<string, boolean> = {};
	$: informationLinks = [
		...informationPages.map((entry) => ({
			...entry,
			path: informationPath(entry),
		})),
		...Object.entries(featurePages).map(([id, entry]) => ({ ...entry, id })),
	];
	$: currentPath = $page.url.pathname.replace(/\/$/, '') || '/';
	$: activeSection =
		informationLinks.find(
			(entry) =>
				currentPath === entry.path || currentPath.startsWith(`${entry.path}/`),
		)?.section ?? routeSections[currentPath.split('/')[1]];
	// Only a section change reveals a group; data refreshes keep manual toggles.
	$: revealSection(activeSection);
	function revealSection(section: string | undefined) {
		if (section) openSections[section] = true;
	}
</script>

<div class="card card-tertiary card-hover overflow-hidden">
	<div class="flex flex-col gap-0 py-2 px-2 items-center">
		{#if isLoggedIn}
			<Button href={themePreviewHref($page.url, '/account')} class="w-full">
				{$_('my-account')}
			</Button>
			<form
				action={themePreviewHref($page.url, '/account/logout')}
				method="post"
				class="flex w-2/3">
				<Button
					type="submit"
					size="sm"
					variant="soft"
					color="secondary"
					class="text-white text-xs p-0.5 rounded-t-none w-full">
					{$_('logout')}
				</Button>
			</form>
		{:else}
			<Button
				href={themePreviewHref($page.url, '/account/login')}
				class="w-full">{$_('login')}</Button>
			<Button
				href={themePreviewHref($page.url, '/account/signup')}
				size="sm"
				variant="soft"
				color="secondary"
				class="text-white w-2/3 text-xs p-0.5 rounded-t-none">
				{$_('create-account')}
			</Button>
		{/if}
	</div>
	<hr class="opacity-5" />
	<div class="py-2 px-2">
		<Button
			href={themePreviewHref($page.url, PUBLIC_DOWNLOAD_URL)}
			class="w-full text-xs p-1">
			{$_('download')}
		</Button>
	</div>
</div>

<div class="sidebar-navigation card card-tertiary text-white overflow-hidden">
	<article class="py-2 px-2">
		<Accordion regionControl="!space-x-2" regionCaret="shrink-0">
			{#each ['about', 'guides'] as section}
				{#if informationLinks.some((entry) => entry.section === section)}
					<AccordionItem bind:open={openSections[section]}>
						<svelte:fragment slot="lead"
							><Fa icon={faBookBookmark} /></svelte:fragment>
						<svelte:fragment slot="summary"
							>{section === 'about'
								? `About ${$page.data.serverName}`
								: 'Game Guides'}</svelte:fragment>
						<svelte:fragment slot="content"
							><nav class="list-nav">
								<ul>
									{#each informationLinks.filter((entry) => entry.section === section) as entry}
										<li>
											<a href={themePreviewHref($page.url, entry.path)}
												>{entry.id === 'server'
													? `About ${$page.data.serverName}`
													: entry.title}</a>
										</li>
									{/each}
								</ul>
							</nav></svelte:fragment>
					</AccordionItem>
				{/if}
			{/each}
			<AccordionItem bind:open={openSections.news}>
				<svelte:fragment slot="lead"><Fa icon={faNewspaper} /></svelte:fragment>
				<svelte:fragment slot="summary">{$_('news')}</svelte:fragment>
				<svelte:fragment slot="content">
					<nav class="list-nav">
						<ul>
							<li>
								<a href={themePreviewHref($page.url, '/')}
									>{$_('latest-news')}</a>
							</li>
							<li>
								<a href={themePreviewHref($page.url, '/news/archive')}
									>{$_('news-archive')}</a>
							</li>
							<li>
								<a href={themePreviewHref($page.url, '/news/event-schedule')}
									>{$_('event-schedule')}</a>
							</li>
						</ul>
					</nav>
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem bind:open={openSections.community}>
				<svelte:fragment slot="lead"
					><Fa icon={faPeopleArrows} /></svelte:fragment>
				<svelte:fragment slot="summary">{$_('community')}</svelte:fragment>
				<svelte:fragment slot="content">
					<nav class="list-nav">
						<ul>
							<li>
								<a href={themePreviewHref($page.url, '/characters')}
									>{$_('characters')}</a>
							</li>
							<li>
								<a href={themePreviewHref($page.url, '/online')}
									>{$_('whos-online')}</a>
							</li>
							{#each Object.values(featurePages).filter((entry) => entry.section === 'community') as entry}
								<li>
									<a href={themePreviewHref($page.url, entry.path)}
										>{entry.title}</a>
								</li>
							{/each}
							<li>
								<a href={themePreviewHref($page.url, '/highscores')}
									>{$_('highscores')}</a>
							</li>
							<li>
								<a href={themePreviewHref($page.url, '/guilds')}
									>{$_('guilds.title')}</a>
							</li>
							<!-- <li><a href="/latest-deaths">Latest deaths</a></li> -->
							<!-- <li><a href="#">Power gamers</a></li> -->
							<!-- <li><a href="#">Staff</a></li> -->
						</ul>
					</nav>
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem bind:open={openSections.library}>
				<svelte:fragment slot="lead"
					><Fa icon={faBookBookmark} /></svelte:fragment>
				<svelte:fragment slot="summary">{$_('library')}</svelte:fragment>
				<svelte:fragment slot="content">
					<nav class="list-nav">
						<ul>
							{#each informationLinks.filter((entry) => entry.section === 'library') as entry}
								<li>
									<a href={themePreviewHref($page.url, entry.path)}
										>{entry.title}</a>
								</li>
							{/each}
							{#each staticPages as staticPage}
								<li>
									<a
										href={themePreviewHref(
											$page.url,
											`/pages/${encodeURIComponent(staticPage.slug)}`,
										)}>{staticPage.title}</a>
								</li>
							{/each}
						</ul>
					</nav>
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem bind:open={openSections.shop}>
				<svelte:fragment slot="lead"><Fa icon={faGifts} /></svelte:fragment>
				<svelte:fragment slot="summary">{$_('shop.title')}</svelte:fragment>
				<svelte:fragment slot="content">
					<nav class="list-nav">
						<ul>
							<li>
								<a href={themePreviewHref($page.url, '/shop')}
									>{$_('buy-coins')}</a>
							</li>
						</ul>
					</nav>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
	</article>
</div>

<style>
	.sidebar-navigation :global(.accordion-lead) {
		flex-shrink: 0;
	}
	.sidebar-navigation :global(.accordion-summary) {
		min-width: 0;
		overflow-wrap: anywhere;
	}
</style>
