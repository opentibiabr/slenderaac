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
	$: informationLinks = [
		...informationPages.map((entry) => ({
			...entry,
			path: informationPath(entry),
		})),
		...Object.entries(featurePages).map(([id, entry]) => ({ ...entry, id })),
	];
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

<div class="card card-tertiary text-white overflow-hidden">
	<article class="py-2 px-2">
		<Accordion>
			{#each ['about', 'guides', 'library'] as section}
				{#if informationLinks.some((entry) => entry.section === section)}
					<AccordionItem open>
						<svelte:fragment slot="lead"
							><Fa icon={faBookBookmark} /></svelte:fragment>
						<svelte:fragment slot="summary"
							>{section === 'about'
								? `About ${$page.data.serverName}`
								: section === 'library'
									? 'Library'
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
			<AccordionItem open>
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
			<AccordionItem open>
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
			<AccordionItem open>
				<svelte:fragment slot="lead"
					><Fa icon={faBookBookmark} /></svelte:fragment>
				<svelte:fragment slot="summary">{$_('library')}</svelte:fragment>
				<svelte:fragment slot="content">
					<nav class="list-nav">
						<ul>
							{#each informationPages.filter((entry) => entry.section === 'library') as entry}
								<li>
									<a href={themePreviewHref($page.url, informationPath(entry))}
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
			<AccordionItem open>
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
