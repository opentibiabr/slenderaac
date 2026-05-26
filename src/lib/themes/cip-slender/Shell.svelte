<script lang="ts">
	import {
		faDiscord,
		faInstagram,
		faWhatsapp,
	} from '@fortawesome/free-brands-svg-icons';
	import {
		faBars,
		faBookBookmark,
		faPerson,
		faToolbox,
	} from '@fortawesome/free-solid-svg-icons';
	import { Drawer, getDrawerStore, LightSwitch } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';

	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';

	import AnimatedOutfit from '$lib/components/ui/AnimatedOutfit.svelte';
	import BoostedSection from '$lib/components/ui/BoostedSection.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ServerStatus from '$lib/components/ui/ServerStatus.svelte';
	import { vocationString } from '$lib/players';
	import { formatSeconds, secondsUntil } from '$lib/utils';

	import {
		PUBLIC_DISCORD_URL,
		PUBLIC_INSTAGRAM_URL,
		PUBLIC_TITLE,
		PUBLIC_WHATSAPP_URL,
		PUBLIC_WIKI_URL,
	} from '$env/static/public';

	import ContentFrame from './ContentFrame.svelte';
	import Menu from './Menu.svelte';
	import ThemeBox from './ThemeBox.svelte';
	import { cipAsset } from './theme';

	import type { LayoutData } from '../../../routes/(app)/$types';

	type CipSlenderLayoutData = LayoutData & {
		selectedTheme?: string;
		themeAssets?: Record<string, string | undefined>;
		themeAssetWarning?: string | null;
	};

	const drawerStore = getDrawerStore();

	export let data: CipSlenderLayoutData;

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
	$: logo = cipAsset(data.themeAssets, 'logo');
	$: background = cipAsset(data.themeAssets, 'background');
	$: menuOrnament = cipAsset(data.themeAssets, 'menuOrnament');
	$: contentOrnament = cipAsset(data.themeAssets, 'contentOrnament');
	$: themeBoxOrnament = cipAsset(data.themeAssets, 'themeBoxOrnament');

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

<div class="theme-cip-slender">
	<div
		class="theme-cip-slender__background {!background
			? 'theme-cip-slender__background--placeholder'
			: ''}"
		style:background-image={background ? `url("${background}")` : undefined}>
	</div>

	{#if isAdmin}
		<div class="theme-cip-slender__admin">
			<a
				href="/admin"
				data-sveltekit-reload
				data-sveltekit-preload-data="off"
				data-sveltekit-preload-code="off">
				Admin
				<Fa icon={faToolbox} />
			</a>
			{#if data.themeAssetWarning}
				<span>{data.themeAssetWarning}</span>
			{/if}
		</div>
	{/if}

	<Drawer
		width="w-64"
		bgDrawer="bg-[#211915]"
		bgBackdrop="bg-black/55 backdrop-blur-sm">
		<div class="theme-cip-slender__drawer">
			<Menu {isLoggedIn} {staticPages} />
		</div>
	</Drawer>

	<div class="theme-cip-slender__shell">
		<aside class="theme-cip-slender__left">
			<a href="/" class="theme-cip-slender__logo" aria-label={PUBLIC_TITLE}>
				{#if logo}
					<img src={logo} alt={PUBLIC_TITLE} />
				{:else}
					<span>{PUBLIC_TITLE}</span>
				{/if}
			</a>
			{#if menuOrnament}
				<img class="theme-cip-slender__ornament" src={menuOrnament} alt="" />
			{/if}
			<Menu {isLoggedIn} {staticPages} />
		</aside>

		<section class="theme-cip-slender__center">
			<header class="theme-cip-slender__topbar">
				<button
					class="theme-cip-slender__mobile-menu"
					type="button"
					on:click={drawerOpen}
					aria-label="Open menu">
					<Fa icon={faBars} />
				</button>
				<div class="theme-cip-slender__links">
					<a href={PUBLIC_DISCORD_URL} target="_blank" rel="noreferrer">
						<Fa icon={faDiscord} />
						{$_('layout.join_discord')}
					</a>
					{#if PUBLIC_WHATSAPP_URL}
						<a href={PUBLIC_WHATSAPP_URL} target="_blank" rel="noreferrer">
							<Fa icon={faWhatsapp} />
							{$_('layout.join_whatsapp')}
						</a>
					{/if}
					{#if PUBLIC_INSTAGRAM_URL}
						<a href={PUBLIC_INSTAGRAM_URL} target="_blank" rel="noreferrer">
							<Fa icon={faInstagram} />
							{$_('layout.follow_instagram')}
						</a>
					{/if}
					{#if PUBLIC_WIKI_URL}
						<a href={PUBLIC_WIKI_URL} target="_blank" rel="noreferrer">
							<Fa icon={faBookBookmark} />
							{$_('layout.wiki')}
						</a>
					{/if}
				</div>
				<div class="theme-cip-slender__status">
					<span>{$_('layout.next_server_save')} {nextServerSave}</span>
					<ServerStatus />
					<LightSwitch />
				</div>
			</header>

			<ContentFrame {title} ornament={contentOrnament}>
				<slot />
			</ContentFrame>

			<footer class="theme-cip-slender__footer">
				© {new Date().getFullYear()}
				<a
					href="https://github.com/luan/slenderaac"
					target="_blank"
					rel="noreferrer">
					SlenderAAC
				</a>
			</footer>
		</section>

		<aside class="theme-cip-slender__right">
			<ThemeBox title="Boosted" ornament={themeBoxOrnament}>
				<BoostedSection {boostedCreature} {boostedBoss} />
			</ThemeBox>

			<ThemeBox title={$_('highscores')} ornament={themeBoxOrnament}>
				<div class="theme-cip-slender__characters">
					{#each highscores as character, i}
						<a href="/characters/{character.name}">
							<span class="theme-cip-slender__rank">{i + 1}</span>
							<AnimatedOutfit
								outfit={character}
								alt={character.name}
								class="scale-75" />
							<span>
								<strong>{character.name}</strong>
								<small>{$_('level')}: {character.level}</small>
							</span>
						</a>
					{/each}
				</div>
				<Button
					href="/highscores"
					size="sm"
					class="theme-cip-slender__box-button">
					{$_('view-more')}
				</Button>
			</ThemeBox>

			{#if accountCharacters}
				<ThemeBox title={$_('your-characters')} ornament={themeBoxOrnament}>
					<div class="theme-cip-slender__characters">
						{#each accountCharacters as character}
							<a href="/characters/{character.name}">
								<Fa icon={faPerson} />
								<AnimatedOutfit
									outfit={character}
									alt={character.name}
									class="scale-75" />
								<span>
									<strong>{character.name}</strong>
									<small>{vocationString(character.vocation)}</small>
								</span>
							</a>
						{/each}
					</div>
				</ThemeBox>
			{/if}
		</aside>
	</div>
</div>

<style>
	.theme-cip-slender {
		position: relative;
		min-height: 100vh;
		padding: 24px 16px;
		color: rgb(42 27 17);
		font-family: Arial, ui-sans-serif, system-ui, sans-serif;
	}

	.theme-cip-slender .theme-cip-slender__background {
		position: fixed;
		inset: 0;
		z-index: 0;
		background-color: rgb(15 12 10);
		background-position: top center;
		background-repeat: no-repeat;
		background-size: cover;
	}

	.theme-cip-slender .theme-cip-slender__background--placeholder {
		background:
			radial-gradient(circle at top, rgb(68 48 30), transparent 44rem),
			linear-gradient(180deg, rgb(17 16 14), rgb(45 32 22));
	}

	.theme-cip-slender .theme-cip-slender__shell {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 190px minmax(0, 1fr) 220px;
		gap: 16px;
		width: min(1180px, 100%);
		margin: 0 auto;
	}

	.theme-cip-slender .theme-cip-slender__left,
	.theme-cip-slender .theme-cip-slender__right {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.theme-cip-slender .theme-cip-slender__center {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 12px;
	}

	.theme-cip-slender .theme-cip-slender__logo {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 126px;
		border: 1px solid rgb(80 58 38);
		background: rgb(31 25 20 / 0.84);
		color: rgb(252 231 177);
		font-size: 22px;
		font-weight: 800;
		text-align: center;
		text-decoration: none;
	}

	.theme-cip-slender .theme-cip-slender__logo img {
		max-width: 160px;
		max-height: 110px;
		object-fit: contain;
	}

	.theme-cip-slender .theme-cip-slender__ornament {
		max-width: 100%;
		object-fit: contain;
	}

	.theme-cip-slender .theme-cip-slender__topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 38px;
		padding: 8px 10px;
		border: 1px solid rgb(80 58 38);
		background: rgb(31 25 20 / 0.92);
		color: rgb(242 226 195);
		font-size: 12px;
	}

	.theme-cip-slender .theme-cip-slender__links,
	.theme-cip-slender .theme-cip-slender__status {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.theme-cip-slender .theme-cip-slender__links a,
	.theme-cip-slender .theme-cip-slender__footer a {
		color: rgb(252 231 177);
		text-decoration: none;
	}

	.theme-cip-slender .theme-cip-slender__links a:hover,
	.theme-cip-slender .theme-cip-slender__footer a:hover {
		color: white;
		text-decoration: underline;
	}

	.theme-cip-slender .theme-cip-slender__mobile-menu {
		display: none;
		width: 34px;
		height: 34px;
		align-items: center;
		justify-content: center;
		border: 1px solid rgb(116 82 45);
		background: rgb(62 37 24);
		color: rgb(252 231 177);
	}

	.theme-cip-slender .theme-cip-slender__drawer {
		padding: 12px;
	}

	.theme-cip-slender .theme-cip-slender__footer {
		padding: 8px;
		color: rgb(242 226 195);
		font-size: 12px;
		text-align: center;
	}

	.theme-cip-slender .theme-cip-slender__admin {
		position: fixed;
		top: 0;
		left: 50%;
		z-index: 50;
		display: flex;
		max-width: min(92vw, 760px);
		transform: translateX(-50%);
		align-items: center;
		gap: 10px;
		border-radius: 0 0 8px 8px;
		background: rgb(127 29 29 / 0.92);
		color: white;
		padding: 4px 12px;
		font-size: 12px;
	}

	.theme-cip-slender .theme-cip-slender__admin a {
		display: flex;
		align-items: center;
		gap: 6px;
		color: white;
		font-weight: 700;
		text-decoration: none;
	}

	.theme-cip-slender .theme-cip-slender__characters {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.theme-cip-slender .theme-cip-slender__characters a {
		display: grid;
		grid-template-columns: auto 42px minmax(0, 1fr);
		align-items: center;
		gap: 4px;
		min-height: 42px;
		color: rgb(242 226 195);
		text-decoration: none;
	}

	.theme-cip-slender .theme-cip-slender__characters a:hover {
		background: rgb(99 59 30 / 0.8);
	}

	.theme-cip-slender .theme-cip-slender__characters strong,
	.theme-cip-slender .theme-cip-slender__characters small {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.theme-cip-slender .theme-cip-slender__characters small {
		color: rgb(213 185 139);
		font-size: 11px;
	}

	.theme-cip-slender .theme-cip-slender__rank {
		display: inline-flex;
		width: 22px;
		height: 22px;
		align-items: center;
		justify-content: center;
		background: rgb(127 84 34);
		color: white;
		font-size: 12px;
		font-weight: 800;
	}

	:global(.theme-cip-slender .theme-cip-slender__box-button) {
		margin-top: 8px;
		width: 100%;
	}

	.theme-cip-slender :global(.card.card-surface),
	.theme-cip-slender :global(.data-table),
	.theme-cip-slender :global(.table-container) {
		border-color: rgb(105 74 44);
		background-color: rgb(239 215 176);
		color: rgb(42 27 17);
	}

	.theme-cip-slender :global(.table-container .table thead) {
		background-color: rgb(88 54 32);
		color: rgb(252 231 177);
	}

	.theme-cip-slender :global(.anchor) {
		color: rgb(111 58 24);
	}

	@media (max-width: 980px) {
		.theme-cip-slender {
			padding: 12px 8px;
		}

		.theme-cip-slender .theme-cip-slender__shell {
			grid-template-columns: minmax(0, 1fr);
		}

		.theme-cip-slender .theme-cip-slender__left,
		.theme-cip-slender .theme-cip-slender__right {
			display: none;
		}

		.theme-cip-slender .theme-cip-slender__topbar {
			flex-wrap: wrap;
		}

		.theme-cip-slender .theme-cip-slender__mobile-menu {
			display: inline-flex;
		}

		.theme-cip-slender .theme-cip-slender__links {
			display: none;
		}
	}
</style>
