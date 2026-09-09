<script lang="ts">
	import {
		faDiscord,
		faInstagram,
		faWhatsapp,
	} from '@fortawesome/free-brands-svg-icons';
	import {
		faBars,
		faBookBookmark,
		faToolbox,
	} from '@fortawesome/free-solid-svg-icons';
	import { AppBar, AppShell, LightSwitch } from '@skeletonlabs/skeleton';
	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';
	import { portal } from 'svelte-portal';

	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';

	import BoostedSection from '$lib/components/ui/BoostedSection.svelte';
	import ServerStatus from '$lib/components/ui/ServerStatus.svelte';
	import SidebarLeft from '$lib/components/ui/SidebarLeft.svelte';
	import SidebarRight from '$lib/components/ui/SidebarRight.svelte';
	import { themePreviewHref } from '$lib/themes/preview';
	import { formatSeconds, secondsUntil } from '$lib/utils';

	import {
		PUBLIC_DISCORD_URL,
		PUBLIC_INSTAGRAM_URL,
		PUBLIC_WHATSAPP_URL,
		PUBLIC_WIKI_URL,
	} from '$env/static/public';

	import type { LayoutData } from '../../../routes/(app)/$types';

	const drawerStore = getDrawerStore();

	export let data: LayoutData & { selectedTheme?: string };

	$: ({
		highscores,
		isLoggedIn,
		boostedBoss,
		boostedCreature,
		isAdmin,
		accountCharacters,
	} = data);
	$: title = typeof $page.data.title === 'string' ? $page.data.title : '';
	$: staticPages = data.staticPages;
	$: serverLogo = data.themeAssets?.serverLogo;

	function drawerOpen(): void {
		drawerStore.open({});
	}
	function drawerClose(): void {
		drawerStore.close();
	}

	beforeNavigate(() => {
		drawerClose();
	});

	let nextServerSave = formatSeconds(secondsUntil(data.nextServerSave));

	onMount(() => {
		const interval = setInterval(() => {
			nextServerSave = formatSeconds(secondsUntil(data.nextServerSave));
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="theme-legbone">
	<div class="theme-legbone-background"></div>
	<div class="theme-legbone-backdrop"></div>
	<div class="theme-legbone-content">
		{#if isAdmin}
			<div
				class="hidden md:flex flex-row justify-center items-start fixed top-0 left-0 right-0"
				use:portal>
				<a
					class="flex gap-2 items-center justify-center rounded-b-lg px-4 py-1 bg-error-800/75 text-white text-sm"
					href="/admin"
					data-sveltekit-reload
					data-sveltekit-preload-data="off"
					data-sveltekit-preload-code="off">
					Admin
					<Fa icon={faToolbox} />
				</a>
			</div>
		{/if}

		<Drawer
			width="w-56"
			bgDrawer="bg-tertiary-900/75 dark:bg-tertiary-800/75"
			bgBackdrop="bg-tertiary-900/50 backdrop-blur-sm">
			<div class="flex flex-col items-stretch gap-2 p-2 pt-4">
				<SidebarLeft {isLoggedIn} {staticPages} />
				<BoostedSection {boostedCreature} {boostedBoss} />
				<SidebarRight {accountCharacters} {highscores} />
			</div>
		</Drawer>

		<AppShell
			slotSidebarLeft="w-0 md:w-56"
			slotSidebarRight="w-0 lg:w-56"
			slotHeader="md:py-1">
			<svelte:fragment slot="header">
				<AppBar
					background="variant-filled-secondary dark:md:bg-transparent md:bg-transparent"
					gridColumns="grid-cols-3"
					slotDefault="place-self-center"
					slotLead="md:w-48 flex items-center justify-center transition-all"
					slotTrail="flex flex-col md:h-full justify-end !items-end">
					<svelte:fragment slot="lead">
						<button class="md:hidden btn btn-sm mr-4" on:click={drawerOpen}>
							<Fa icon={faBars} />
						</button>
						<div
							class="w-full h-full -mb-6 hidden md:flex flex-col items-center justify-end">
							<a
								class="server-brand server-brand--desktop"
								href={themePreviewHref($page.url, '/')}
								aria-label={data.serverName}>
								{#if serverLogo}<img
										src={serverLogo}
										alt={data.serverName} />{:else}<span>{data.serverName}</span
									>{/if}
							</a>
						</div>
					</svelte:fragment>
					<div class="flex md:hidden items-center gap-2">
						<a
							class="server-brand server-brand--mobile"
							href={themePreviewHref($page.url, '/')}
							aria-label={data.serverName}>
							{#if serverLogo}<img
									src={serverLogo}
									alt={data.serverName} />{:else}<span>{data.serverName}</span
								>{/if}
						</a>
					</div>
					<svelte:fragment slot="trail">
						<div class="hidden md:block w-48">
							<BoostedSection {boostedCreature} {boostedBoss} />
						</div>
						<div class="block md:hidden">
							<LightSwitch />
						</div>
					</svelte:fragment>
				</AppBar>
			</svelte:fragment>
			<nav class="mx-4 mt-2 flex flex-col gap-2" slot="sidebarLeft">
				<SidebarLeft {isLoggedIn} {staticPages} />
				<nav class="hidden md:flex lg:hidden mx-4 mt-2 flex-col gap-2 pt-4">
					<SidebarRight {accountCharacters} {highscores} />
				</nav>
			</nav>
			<nav class="mx-4 mt-2 flex flex-col gap-2" slot="sidebarRight">
				<SidebarRight {accountCharacters} {highscores} />
			</nav>
			<svelte:fragment slot="pageHeader">
				<AppBar
					padding="py-2 pl-2 pr-1"
					class="hidden md:mr-2 lg:mr-0 md:block mt-2 text-white text-xs rounded-container-token variant-filled-secondary"
					slotTrail="!space-x-2"
					background="bg-secondary-500">
					<span class="flex flex-row gap-2" slot="lead">
						<a
							href={PUBLIC_DISCORD_URL}
							target="_blank"
							rel="noreferrer"
							class="flex flex-row items-center gap-1">
							<Fa icon={faDiscord} />
							{$_('layout.join_discord')}
						</a>
						{#if PUBLIC_WHATSAPP_URL}
							<a
								href={PUBLIC_WHATSAPP_URL}
								target="_blank"
								rel="noreferrer"
								class="flex flex-row items-center gap-1">
								<Fa icon={faWhatsapp} />
								{$_('layout.join_whatsapp')}
							</a>
						{/if}
						{#if PUBLIC_INSTAGRAM_URL}
							<a
								href={PUBLIC_INSTAGRAM_URL}
								target="_blank"
								rel="noreferrer"
								class="flex flex-row items-center gap-1">
								<Fa icon={faInstagram} />
								{$_('layout.follow_instagram')}
							</a>
						{/if}
						{#if PUBLIC_WIKI_URL}
							<a
								href={PUBLIC_WIKI_URL}
								target="_blank"
								rel="noreferrer"
								class="flex flex-row items-center gap-1">
								<Fa icon={faBookBookmark} />
								{$_('layout.wiki')}
							</a>
						{/if}
					</span>
					<svelte:fragment slot="trail">
						<div>
							{$_('layout.next_server_save')}
							{nextServerSave}
						</div>
						<ServerStatus />
						<LightSwitch />
					</svelte:fragment>
				</AppBar>
			</svelte:fragment>

			<main class="mx-2 md:ml-0 lg:mx-0 my-2 card card-surface transition-all">
				{#if title.length > 0}
					<div
						class="rounded-container-token px-4 py-1 bg-tertiary-900 text-warning-400">
						<h4 class="h4">{title}</h4>
					</div>
				{/if}

				<div
					class="theme-legbone-page-body px-4 pt-2 pb-2 overflow-y-auto flex flex-col items-center">
					<slot />
				</div>
			</main>
			<svelte:fragment slot="pageFooter">
				<div class="flex-flex-row justify-center items-center">
					<div
						class="m-auto mb-2 w-fit px-4 text-white font-extralight bg-slate-600/75 rounded-full text-sm">
						© {new Date().getFullYear()}
						<a
							href="https://github.com/luan/slenderaac"
							target="_blank"
							class="anchor !text-slate-300">SlenderAAC</a>
					</div>
				</div>
			</svelte:fragment>
		</AppShell>
	</div>
</div>

<style>
	/* Section navigation follows the document, so intermediate shells cannot own scrolling. */
	:global(.theme-legbone:has(.section-navigation) .theme-legbone-content),
	:global(.theme-legbone:has(.section-navigation) #appShell),
	:global(.theme-legbone:has(.section-navigation) #appShell > div),
	:global(.theme-legbone:has(.section-navigation) #page),
	:global(.theme-legbone:has(.section-navigation) .theme-legbone-page-body) {
		overflow: visible;
		min-width: 0;
	}
	.server-brand {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-weight: bold;
		overflow-wrap: anywhere;
	}
	.server-brand--desktop {
		width: 144px;
		height: 128px;
		font-size: 28px;
		color: rgb(255 233 172);
		text-shadow: 1px 2px 3px black;
	}
	.server-brand--mobile {
		min-width: 0;
		max-width: 100%;
		height: 48px;
		font-size: 18px;
	}
	.server-brand img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
