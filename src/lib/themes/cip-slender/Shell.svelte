<script lang="ts">
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	import {
		faBars,
		faBookBookmark,
		faGift,
		faToolbox,
	} from '@fortawesome/free-solid-svg-icons';
	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';

	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';

	import AnimatedOutfit from '$lib/components/ui/AnimatedOutfit.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	import {
		PUBLIC_DISCORD_URL,
		PUBLIC_TITLE,
		PUBLIC_DOWNLOAD_URL,
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

	type CipSlenderTopbarStats = {
		twitchChannels?: number | null;
		twitchViewers?: number | null;
		youtubeChannels?: number | null;
		youtubeViewers?: number | null;
	};

	const drawerStore = getDrawerStore();

	export let data: CipSlenderLayoutData;

	$: ({ highscores, isLoggedIn, isAdmin, boostedBoss, boostedCreature } = data);
	$: title = typeof $page.data.title === 'string' ? $page.data.title : '';
	$: showCipGrid = $page.url.searchParams.get('cipGrid') === '1';
	$: themeSwitchHref = (() => {
		const nextUrl = new URL($page.url.href);
		nextUrl.searchParams.set('themePreview', 'legbone');
		nextUrl.searchParams.delete('cipGrid');

		return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
	})();
	$: staticPages = data.staticPages;
	$: logo = cipAsset(data.themeAssets, 'logo');
	$: background = cipAsset(data.themeAssets, 'background');
	$: menuOrnament = cipAsset(data.themeAssets, 'menuOrnament');
	$: contentOrnament = cipAsset(data.themeAssets, 'contentOrnament');
	$: themeBoxOrnament = cipAsset(data.themeAssets, 'themeBoxOrnament');
	$: topIconTwitch = cipAsset(data.themeAssets, 'topIconTwitch');
	$: topIconYoutube = cipAsset(data.themeAssets, 'topIconYoutube');
	$: topIconDownload = cipAsset(data.themeAssets, 'topIconDownload');
	$: topIconOnline = cipAsset(data.themeAssets, 'topIconOnline');
	$: contentTitleBackground = cipAsset(
		data.themeAssets,
		'contentTitleBackground',
	);
	$: contentCacheTitleBackground = cipAsset(
		data.themeAssets,
		'contentCacheTitleBackground',
	);
	$: contentFrameHorizontal = cipAsset(
		data.themeAssets,
		'contentFrameHorizontal',
	);
	$: contentFrameVertical = cipAsset(data.themeAssets, 'contentFrameVertical');
	$: contentFrameEdge = cipAsset(data.themeAssets, 'contentFrameEdge');
	$: contentCornerTopLeft = cipAsset(data.themeAssets, 'contentCornerTopLeft');
	$: contentCornerTopRight = cipAsset(
		data.themeAssets,
		'contentCornerTopRight',
	);
	$: contentCornerBottomLeft = cipAsset(
		data.themeAssets,
		'contentCornerBottomLeft',
	);
	$: contentCornerBottomRight = cipAsset(
		data.themeAssets,
		'contentCornerBottomRight',
	);
	$: contentBorder = cipAsset(data.themeAssets, 'contentBorder');
	$: paperTexture = cipAsset(data.themeAssets, 'paperTexture');
	$: newsHeadlineBackground = cipAsset(
		data.themeAssets,
		'newsHeadlineBackground',
	);
	$: headlineNewsTicker = cipAsset(data.themeAssets, 'headlineNewsTicker');
	$: headlineNews = cipAsset(data.themeAssets, 'headlineNews');
	$: newsTickerIconCommunity = cipAsset(
		data.themeAssets,
		'newsTickerIconCommunity',
	);
	$: newsTickerIconDevelopment = cipAsset(
		data.themeAssets,
		'newsTickerIconDevelopment',
	);
	$: newsHeadlineIcon = cipAsset(data.themeAssets, 'newsHeadlineIcon');
	$: tickerExpandIcon = cipAsset(data.themeAssets, 'menuExpandPlus');
	$: boxTop = cipAsset(data.themeAssets, 'boxTop');
	$: boxBottom = cipAsset(data.themeAssets, 'boxBottom');
	$: boxHeader = cipAsset(data.themeAssets, 'boxHeader');
	$: chain = cipAsset(data.themeAssets, 'chain');
	$: loginButton = cipAsset(data.themeAssets, 'loginButton');
	$: myAccountButton = cipAsset(data.themeAssets, 'myAccountButton');
	$: logoutButton = cipAsset(data.themeAssets, 'logoutButton');
	$: createAccountButton = cipAsset(data.themeAssets, 'createAccountButton');
	$: downloadButton = cipAsset(data.themeAssets, 'downloadButton');
	$: loginBoxBackground = cipAsset(data.themeAssets, 'loginBoxBackground');
	$: loginCreateAccountText = cipAsset(
		data.themeAssets,
		'loginCreateAccountText',
	);
	$: smallButtonBackground = cipAsset(
		data.themeAssets,
		'smallButtonBackground',
	);
	$: smallButtonHover = cipAsset(data.themeAssets, 'smallButtonHover');
	$: mediumButtonBackground = cipAsset(
		data.themeAssets,
		'mediumButtonBackground',
	);
	$: mediumButtonHover = cipAsset(data.themeAssets, 'mediumButtonHover');
	$: accountButtonStyle = [
		smallButtonBackground
			? `--cip-small-button: url("${smallButtonBackground}")`
			: '',
		smallButtonHover
			? `--cip-small-button-hover: url("${smallButtonHover}")`
			: '',
		mediumButtonBackground
			? `--cip-medium-button: url("${mediumButtonBackground}")`
			: '',
		mediumButtonHover
			? `--cip-medium-button-hover: url("${mediumButtonHover}")`
			: '',
		loginBoxBackground
			? `--cip-loginbox-background: url("${loginBoxBackground}")`
			: '',
		chain ? `--cip-chain: url("${chain}")` : '',
		boxTop ? `--cip-small-box-top: url("${boxTop}")` : '',
		boxBottom ? `--cip-small-box-bottom: url("${boxBottom}")` : '',
	]
		.filter(Boolean)
		.join('; ');
	$: contentChromeStyle = [
		contentTitleBackground
			? `--cip-content-title: url("${contentTitleBackground}")`
			: '',
		contentFrameHorizontal
			? `--cip-content-frame-horizontal: url("${contentFrameHorizontal}")`
			: '',
		contentFrameVertical
			? `--cip-content-frame-vertical: url("${contentFrameVertical}")`
			: '',
		contentFrameEdge
			? `--cip-content-frame-edge: url("${contentFrameEdge}")`
			: '',
		tickerExpandIcon ? `--cip-ticker-expand: url("${tickerExpandIcon}")` : '',
		contentBorder ? `--cip-content-border: url("${contentBorder}")` : '',
	]
		.filter(Boolean)
		.join('; ');
	$: promoPremiumBox = cipAsset(data.themeAssets, 'promoPremiumBox');
	$: premiumPromoArt = cipAsset(data.themeAssets, 'premiumPromoArt');
	$: premiumButtonBackground = cipAsset(
		data.themeAssets,
		'premiumButtonBackground',
	);
	$: premiumButtonHover = cipAsset(data.themeAssets, 'premiumButtonHover');
	$: premiumButtonStyle = [
		premiumButtonBackground
			? `--cip-premium-button: url("${premiumButtonBackground}")`
			: '',
		premiumButtonHover
			? `--cip-premium-button-hover: url("${premiumButtonHover}")`
			: '',
	]
		.filter(Boolean)
		.join('; ');
	$: shellStyle = [
		newsHeadlineBackground
			? `--cip-news-headline: url("${newsHeadlineBackground}")`
			: '',
		contentCacheTitleBackground
			? `--cip-cache-title: url("${contentCacheTitleBackground}")`
			: '',
		contentBorder ? `--cip-content-border: url("${contentBorder}")` : '',
		contentFrameHorizontal
			? `--cip-info-frame-horizontal: url("${contentFrameHorizontal}")`
			: '',
		contentFrameVertical
			? `--cip-info-frame-vertical: url("${contentFrameVertical}")`
			: '',
		contentFrameEdge ? `--cip-info-frame-edge: url("${contentFrameEdge}")` : '',
		contentCornerTopLeft
			? `--cip-info-corner-tl: url("${contentCornerTopLeft}")`
			: '',
		contentCornerTopRight
			? `--cip-info-corner-tr: url("${contentCornerTopRight}")`
			: '',
		contentCornerBottomLeft
			? `--cip-info-corner-bl: url("${contentCornerBottomLeft}")`
			: '',
		contentCornerBottomRight
			? `--cip-info-corner-br: url("${contentCornerBottomRight}")`
			: '',
		newsHeadlineIcon ? `--cip-news-icon: url("${newsHeadlineIcon}")` : '',
	]
		.filter(Boolean)
		.join('; ');
	$: promoNetworksBox = cipAsset(data.themeAssets, 'promoNetworksBox');
	$: networkFacebook = cipAsset(data.themeAssets, 'networkFacebook');
	$: networkYoutube = cipAsset(data.themeAssets, 'networkYoutube');
	$: promoTrailerBox = cipAsset(data.themeAssets, 'promoTrailerBox');
	$: trailerPreview = cipAsset(data.themeAssets, 'trailerPreview');
	$: promoScreenshotBox = cipAsset(data.themeAssets, 'promoScreenshotBox');
	$: promoScreenshotFrame = cipAsset(data.themeAssets, 'promoScreenshotFrame');
	$: promoScreenshotImage = cipAsset(data.themeAssets, 'promoScreenshotImage');
	$: promoPollBox = cipAsset(data.themeAssets, 'promoPollBox');
	$: rightTopper = cipAsset(data.themeAssets, 'rightTopper');
	$: rightCreature = cipAsset(data.themeAssets, 'rightCreature');
	$: rightBoss = cipAsset(data.themeAssets, 'rightBoss');

	function drawerOpen(): void {
		drawerStore.open({});
	}
	function drawerClose(): void {
		drawerStore.close();
	}

	beforeNavigate(() => {
		drawerClose();
	});

	let onlinePlayerCount = 0;
	let topbarStats: Required<CipSlenderTopbarStats> = {
		twitchChannels: 0,
		twitchViewers: 0,
		youtubeChannels: 0,
		youtubeViewers: 0,
	};

	function normalizeTopbarCount(value: number | null | undefined): number {
		return typeof value === 'number' && Number.isFinite(value)
			? Math.max(0, Math.trunc(value))
			: 0;
	}

	function normalizeTopbarStats(
		stats: CipSlenderTopbarStats | null | undefined,
	): Required<CipSlenderTopbarStats> {
		return {
			twitchChannels: normalizeTopbarCount(stats?.twitchChannels),
			twitchViewers: normalizeTopbarCount(stats?.twitchViewers),
			youtubeChannels: normalizeTopbarCount(stats?.youtubeChannels),
			youtubeViewers: normalizeTopbarCount(stats?.youtubeViewers),
		};
	}

	const topbarNumberFormat = new Intl.NumberFormat('en-US');
	const formatTopbarCount = (value: number): string =>
		topbarNumberFormat.format(normalizeTopbarCount(value));

	$: formattedOnlinePlayerCount = new Intl.NumberFormat('en-US').format(
		onlinePlayerCount,
	);
	$: formattedTwitchChannels = formatTopbarCount(topbarStats.twitchChannels);
	$: formattedTwitchViewers = formatTopbarCount(topbarStats.twitchViewers);
	$: formattedYoutubeChannels = formatTopbarCount(topbarStats.youtubeChannels);
	$: formattedYoutubeViewers = formatTopbarCount(topbarStats.youtubeViewers);

	async function refreshOnlineStatus(): Promise<void> {
		const response = await fetch('/api/online-status');
		if (!response.ok) return;

		const status = (await response.json()) as {
			onlinePlayerCount?: number;
			topbarStats?: CipSlenderTopbarStats;
		};
		onlinePlayerCount = normalizeTopbarCount(status.onlinePlayerCount);
		topbarStats = normalizeTopbarStats(status.topbarStats);
	}

	onMount(() => {
		void refreshOnlineStatus();
		const interval = setInterval(refreshOnlineStatus, 5000);

		return () => clearInterval(interval);
	});
</script>

<div class="theme-cip-slender" style={shellStyle}>
	<div
		class="theme-cip-slender__background {!background
			? 'theme-cip-slender__background--placeholder'
			: ''}"
		style:background-image={background ? `url("${background}")` : undefined}>
	</div>
	{#if showCipGrid}
		<div class="theme-cip-slender__alignment-grid" aria-hidden="true">
			<span>32px SQM grid</span>
		</div>
	{/if}

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
			<Menu {isLoggedIn} {staticPages} assets={data.themeAssets} />
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

			<section
				class="theme-cip-slender__account-box"
				style={accountButtonStyle}>
				<div class="theme-cip-slender__account-panel">
					{#if isLoggedIn}
						<a
							class="theme-cip-slender__image-button theme-cip-slender__image-button--medium"
							href="/account">
							{#if myAccountButton}
								<img src={myAccountButton} alt={$_('my-account')} />
							{:else}
								<span>{$_('my-account')}</span>
							{/if}
						</a>
						<form action="/account/logout" method="post">
							<button
								class="theme-cip-slender__create-account-link"
								type="submit">
								{#if logoutButton}
									<img src={logoutButton} alt={$_('logout')} />
								{:else}
									<span>{$_('logout')}</span>
								{/if}
							</button>
						</form>
					{:else}
						<a
							class={`theme-cip-slender__image-button theme-cip-slender__image-button--medium ${
								loginButton
									? 'theme-cip-slender__image-button--rendered'
									: ''
							}`}
							href="/account/login">
							{#if loginButton}
								<img src={loginButton} alt={$_('login')} />
							{:else}
								<span>{$_('login')}</span>
							{/if}
						</a>
						<a
							class="theme-cip-slender__create-account-link theme-cip-slender__create-account-link--loginbox"
							href="/account/signup">
							{#if loginCreateAccountText}
								<img src={loginCreateAccountText} alt={$_('create-account')} />
							{:else if createAccountButton}
								<img
									class="theme-cip-slender__create-account-link-fallback"
									src={createAccountButton}
									alt={$_('create-account')} />
							{:else}
								<span>{$_('create-account')}</span>
							{/if}
						</a>
					{/if}
				</div>
				<div class="theme-cip-slender__download-panel">
					<a
						class={`theme-cip-slender__image-button theme-cip-slender__image-button--medium ${
							downloadButton
								? 'theme-cip-slender__image-button--rendered'
								: ''
						}`}
						href={PUBLIC_DOWNLOAD_URL}>
						{#if downloadButton}
							<img src={downloadButton} alt={$_('download')} />
						{:else}
							<span>{$_('download')}</span>
						{/if}
					</a>
				</div>
			</section>

			<Menu
				{isLoggedIn}
				{staticPages}
				assets={data.themeAssets}
				showAccountActions={false} />
		</aside>

		<section class="theme-cip-slender__center">
			<div class="theme-cip-slender__center-spacer"></div>
			<header class="theme-cip-slender__topbar theme-cip-slender__center-chrome">
				<button
					class="theme-cip-slender__mobile-menu"
					type="button"
					on:click={drawerOpen}
					aria-label="Open menu">
					<Fa icon={faBars} />
				</button>
				<div class="theme-cip-slender__links">
					<a
						class="theme-cip-slender__info-item theme-cip-slender__info-item--twitch"
						href={PUBLIC_DISCORD_URL}
						target="_blank"
						rel="noreferrer">
						{#if topIconTwitch}
							<img src={topIconTwitch} alt="Twitch" />
						{:else}
							<Fa icon={faDiscord} />
						{/if}
						<span>({formattedTwitchChannels})</span>
						<span class="theme-cip-slender__info-watch" aria-hidden="true"
						></span>
						<span>{formattedTwitchViewers}</span>
					</a>
					{#if PUBLIC_WIKI_URL}
						<a
							class="theme-cip-slender__info-item theme-cip-slender__info-item--youtube"
							href={PUBLIC_WIKI_URL}
							target="_blank"
							rel="noreferrer">
							{#if topIconYoutube}
								<img src={topIconYoutube} alt="YouTube" />
							{:else}
								<Fa icon={faBookBookmark} />
							{/if}
							<span>({formattedYoutubeChannels})</span>
							<span class="theme-cip-slender__info-watch" aria-hidden="true"
							></span>
							<span>{formattedYoutubeViewers}</span>
						</a>
					{/if}
					<a
						class="theme-cip-slender__info-item theme-cip-slender__info-item--download"
						href={PUBLIC_DOWNLOAD_URL}>
						{#if topIconDownload}
							<img src={topIconDownload} alt="" aria-hidden="true" />
						{/if}
						<span>Fankit</span>
					</a>
				</div>
				<div class="theme-cip-slender__status">
					<a class="theme-cip-slender__players-online" href="/online">
						{#if topIconOnline}
							<img src={topIconOnline} alt="" aria-hidden="true" />
						{:else}
							<Fa icon={faGift} />
						{/if}
						<span>{formattedOnlinePlayerCount} Players Online</span>
					</a>
				</div>
			</header>

			<section
				class="theme-cip-slender__ticker theme-cip-slender__center-chrome"
				style={contentChromeStyle}>
				<header>
					{#if headlineNewsTicker}
						<img
							class="theme-cip-slender__headline-image"
							src={headlineNewsTicker}
							alt="News Ticker" />
					{:else if contentOrnament}
						<img src={contentOrnament} alt="" aria-hidden="true" />
						<h2>News Ticker</h2>
					{:else}
						<h2>News Ticker</h2>
					{/if}
				</header>
				<div class="theme-cip-slender__ticker-body">
					<a href="/">
						{#if newsTickerIconDevelopment}
							<img src={newsTickerIconDevelopment} alt="" aria-hidden="true" />
						{/if}
						<span>May 22 2026</span>
						<strong>SlenderAAC</strong>
						has received a new Cip-like external theme pack preview.
					</a>
					<a href="/">
						{#if newsTickerIconCommunity}
							<img src={newsTickerIconCommunity} alt="" aria-hidden="true" />
						{/if}
						<span>May 21 2026</span>
						<strong>Theme assets</strong>
						are loaded from the mounted pack instead of the repository.
					</a>
					<a href="/">
						{#if newsTickerIconDevelopment}
							<img src={newsTickerIconDevelopment} alt="" aria-hidden="true" />
						{/if}
						<span>May 20 2026</span>
						<strong>Layout shell</strong>
						now uses shared routes, shared loads and external images.
					</a>
					<a href="/">
						{#if newsTickerIconCommunity}
							<img src={newsTickerIconCommunity} alt="" aria-hidden="true" />
						{/if}
						<span>May 19 2026</span>
						<strong>Security</strong>
						blocks traversal, dotfiles, directories and invalid extensions.
					</a>
					<a href="/">
						{#if newsTickerIconDevelopment}
							<img src={newsTickerIconDevelopment} alt="" aria-hidden="true" />
						{/if}
						<span>May 18 2026</span>
						<strong>Preview mode</strong>
						keeps layout comparison data separate from application routes.
					</a>
				</div>
			</section>

			<ContentFrame
				{title}
				ornament={contentOrnament}
				titleBackground={contentTitleBackground}
				frameHorizontal={contentFrameHorizontal}
				frameVertical={contentFrameVertical}
				frameEdge={contentFrameEdge}
				border={contentBorder}
				headlineImage={title === 'Latest News' ? headlineNews : null}
				{paperTexture}>
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
			<div class="theme-cip-slender__right-spacer">
				<a
					class="theme-cip-slender__theme-switch"
					href={themeSwitchHref}
					aria-label="Preview normal Slender layout">
					Slender
				</a>
				{#if rightTopper}
					<img
						class="theme-cip-slender__pedestal"
						src={rightTopper}
						alt=""
						aria-hidden="true" />
				{/if}
				<div
					class="theme-cip-slender__right-boost theme-cip-slender__right-boost--creature">
					{#if rightCreature}
						<img src={rightCreature} alt="" aria-hidden="true" />
					{/if}
					{#if boostedCreature}
						<AnimatedOutfit
							outfit={boostedCreature}
							alt={boostedCreature.boostname ?? 'Boosted creature'}
							class="theme-cip-slender__boosted-avatar theme-cip-slender__boosted-avatar--creature"
							innerClass="theme-cip-slender__boosted-avatar-inner theme-cip-slender__boosted-avatar-inner--creature" />
					{/if}
				</div>
				<div
					class="theme-cip-slender__right-boost theme-cip-slender__right-boost--boss">
					{#if rightBoss}
						<img src={rightBoss} alt="" aria-hidden="true" />
					{/if}
					{#if boostedBoss}
						<AnimatedOutfit
							outfit={boostedBoss}
							alt={boostedBoss.boostname ?? 'Boosted boss'}
							class="theme-cip-slender__boosted-avatar theme-cip-slender__boosted-avatar--boss"
							innerClass="theme-cip-slender__boosted-avatar-inner theme-cip-slender__boosted-avatar-inner--boss" />
					{/if}
				</div>
			</div>

			{#if promoPremiumBox}
				<a
					class="theme-cip-slender__official-box theme-cip-slender__official-box--premium"
					style={premiumButtonStyle}
					href="/shop">
					<img src={promoPremiumBox} alt="Webshop" />
					<strong class="theme-cip-slender__premium-offer">
						Get Supplies Anywhere!
					</strong>
					{#if premiumPromoArt}
						<span class="theme-cip-slender__premium-art">
							<img src={premiumPromoArt} alt="" aria-hidden="true" />
						</span>
					{/if}
					<span class="theme-cip-slender__premium-button">
						<span>Get Tibia Coins</span>
					</span>
				</a>
			{/if}

			{#if promoNetworksBox}
				<div
					class="theme-cip-slender__official-box theme-cip-slender__official-box--network">
					<img src={promoNetworksBox} alt="Networks" />
					<div class="theme-cip-slender__network-links">
						<a href={PUBLIC_DISCORD_URL} target="_blank" rel="noreferrer">
							{#if networkFacebook}
								<img src={networkFacebook} alt="Discord" />
							{:else}
								<Fa icon={faDiscord} />
							{/if}
						</a>
						{#if PUBLIC_WIKI_URL}
							<a href={PUBLIC_WIKI_URL} target="_blank" rel="noreferrer">
								{#if networkYoutube}
									<img src={networkYoutube} alt="Wiki" />
								{:else}
									<Fa icon={faBookBookmark} />
								{/if}
							</a>
						{/if}
					</div>
				</div>
			{/if}

			{#if promoTrailerBox}
				<div
					class="theme-cip-slender__official-box theme-cip-slender__official-box--trailer">
					<img src={promoTrailerBox} alt="Trailer" />
					{#if trailerPreview}
						<img
							class="theme-cip-slender__trailer-preview"
							src={trailerPreview}
							alt="" />
					{/if}
				</div>
			{/if}

			{#if promoScreenshotBox}
				<div
					class="theme-cip-slender__official-box theme-cip-slender__official-box--screenshot">
					<img src={promoScreenshotBox} alt="Screenshots" />
					{#if promoScreenshotFrame && promoScreenshotImage}
						<div
							class="theme-cip-slender__screenshot-frame"
							style={`background-image: url("${promoScreenshotFrame}")`}>
							<img src={promoScreenshotImage} alt="" />
						</div>
					{/if}
				</div>
			{/if}

			{#if promoPollBox}
				<div
					class="theme-cip-slender__official-box theme-cip-slender__official-box--poll">
					<img src={promoPollBox} alt="Current Poll" />
				</div>
			{/if}

			<ThemeBox
				title={$_('highscores')}
				ornament={themeBoxOrnament}
				headerBackground={boxHeader}
				top={boxTop}
				bottom={boxBottom}>
				<div class="theme-cip-slender__compact-characters">
					{#each highscores as character, i}
						<a href="/characters/{character.name}">
							<span class="theme-cip-slender__rank">{i + 1}</span>
							<strong>{character.name}</strong>
							<small>{$_('level')}: {character.level}</small>
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
		</aside>
	</div>
</div>

<style>
	.theme-cip-slender {
		position: relative;
		min-height: 100vh;
		padding: 8px 0 42px;
		background: rgb(6 17 33);
		color: rgb(42 27 17);
		font-family: Verdana, Arial, ui-sans-serif, system-ui, sans-serif;
	}

	.theme-cip-slender .theme-cip-slender__background {
		position: fixed;
		inset: 0;
		z-index: 0;
		background-color: rgb(6 17 33);
		background-position: top center;
		background-repeat: no-repeat;
		background-size: min(1600px, 100vw) auto;
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
		grid-template-columns: 180px minmax(620px, 868px) 180px;
		align-items: start;
		column-gap: 14px;
		row-gap: 12px;
		width: min(1263px, calc(100vw - 24px));
		margin: 0 auto;
		left: 6px;
		top: -3px;
	}

	.theme-cip-slender .theme-cip-slender__alignment-grid {
		position: fixed;
		inset: 0;
		z-index: 20;
		pointer-events: none;
		background:
			linear-gradient(rgb(60 255 115 / 0.18) 1px, transparent 1px) 0 0 / 32px
				32px,
			linear-gradient(90deg, rgb(60 255 115 / 0.18) 1px, transparent 1px) 0 0 /
				32px 32px,
			linear-gradient(rgb(255 210 70 / 0.24) 1px, transparent 1px) 0 0 / 160px
				160px,
			linear-gradient(90deg, rgb(255 210 70 / 0.24) 1px, transparent 1px) 0 0 /
				160px 160px;
	}

	.theme-cip-slender .theme-cip-slender__alignment-grid span {
		position: fixed;
		top: 8px;
		right: 10px;
		padding: 3px 6px;
		border: 1px solid rgb(255 210 70 / 0.8);
		background: rgb(0 0 0 / 0.72);
		color: rgb(255 238 140);
		font-size: 11px;
		font-weight: 700;
		text-shadow: 1px 1px 0 rgb(0 0 0);
	}

	.theme-cip-slender .theme-cip-slender__left,
	.theme-cip-slender .theme-cip-slender__right {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.theme-cip-slender .theme-cip-slender__left {
		gap: 4px;
	}

	.theme-cip-slender .theme-cip-slender__center {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 8px;
	}

	.theme-cip-slender .theme-cip-slender__center-spacer {
		height: 146px;
		flex: 0 0 146px;
	}

	.theme-cip-slender .theme-cip-slender__logo {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 158px;
		border: 0;
		background: transparent;
		color: rgb(252 231 177);
		font-size: 22px;
		font-weight: 800;
		text-align: center;
		text-decoration: none;
	}

	.theme-cip-slender .theme-cip-slender__logo img {
		max-width: 196px;
		max-height: 158px;
		object-fit: contain;
		transform: translate(-1px, -2px);
	}

	.theme-cip-slender .theme-cip-slender__ornament {
		width: 180px;
		height: 12px;
		max-width: 100%;
		object-fit: contain;
		visibility: hidden;
	}

	.theme-cip-slender .theme-cip-slender__account-box {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 30px;
		margin-top: 0;
		margin-bottom: 0;
		padding: 0;
		border: 0;
		background: transparent;
		box-shadow: none;
		transform: translate(1px, -17px);
	}

	.theme-cip-slender .theme-cip-slender__account-panel,
	.theme-cip-slender .theme-cip-slender__download-panel {
		position: relative;
		display: flex;
		width: 180px;
		flex-direction: column;
		align-items: center;
		border: 0;
		background-image:
			var(--cip-chain, none), var(--cip-chain, none),
			var(--cip-loginbox-background, none);
		background-position:
			5px 2px,
			right 5px top 2px,
			center 2px;
		background-size:
			7px 10px,
			7px 10px,
			160px 13px;
		background-repeat: repeat-y, repeat-y, repeat-y;
	}

	.theme-cip-slender .theme-cip-slender__account-panel {
		gap: 2px;
		padding: 3px 14px;
	}

	.theme-cip-slender .theme-cip-slender__download-panel {
		padding: 3px 14px;
	}

	.theme-cip-slender .theme-cip-slender__account-panel::before,
	.theme-cip-slender .theme-cip-slender__account-panel::after,
	.theme-cip-slender .theme-cip-slender__download-panel::before,
	.theme-cip-slender .theme-cip-slender__download-panel::after {
		position: absolute;
		right: 0;
		left: 0;
		height: 12px;
		background-repeat: repeat-x;
		background-size: auto 12px;
		content: '';
		pointer-events: none;
	}

	.theme-cip-slender .theme-cip-slender__account-panel::before,
	.theme-cip-slender .theme-cip-slender__download-panel::before {
		top: -10px;
		background-image: var(--cip-small-box-top, var(--cip-chain, none));
	}

	.theme-cip-slender .theme-cip-slender__account-panel::after,
	.theme-cip-slender .theme-cip-slender__download-panel::after {
		bottom: -10px;
		background-image: var(--cip-small-box-bottom, var(--cip-chain, none));
	}

	.theme-cip-slender .theme-cip-slender__account-box form {
		margin: 0;
	}

	.theme-cip-slender .theme-cip-slender__image-button {
		display: flex;
		min-height: 25px;
		align-items: center;
		justify-content: center;
		border: 0;
		color: rgb(255 238 65);
		cursor: pointer;
		font-size: 14px;
		font-weight: 800;
		text-align: center;
		text-decoration: none;
		text-shadow: 1px 1px 0 rgb(0 0 0);
	}

	.theme-cip-slender .theme-cip-slender__image-button--small {
		width: 135px;
		height: 25px;
		background: var(
				--cip-small-button,
				linear-gradient(180deg, rgb(35 65 236), rgb(8 7 139))
			)
			center / 100% 100% no-repeat;
	}

	.theme-cip-slender .theme-cip-slender__image-button--medium {
		width: 150px;
		height: 37px;
		background: var(
				--cip-medium-button,
				linear-gradient(180deg, rgb(35 65 236), rgb(8 7 139))
			)
			center / 100% 100% no-repeat;
	}

	.theme-cip-slender
		.theme-cip-slender__image-button--medium.theme-cip-slender__image-button--rendered {
		background: transparent;
	}

	.theme-cip-slender .theme-cip-slender__image-button--small:hover,
	.theme-cip-slender .theme-cip-slender__image-button--small:focus {
		background: var(
				--cip-small-button-hover,
				linear-gradient(180deg, rgb(54 86 255), rgb(11 9 169))
			)
			center / 100% 100% no-repeat;
	}

	.theme-cip-slender .theme-cip-slender__image-button--medium:hover,
	.theme-cip-slender .theme-cip-slender__image-button--medium:focus {
		background: var(
				--cip-medium-button-hover,
				linear-gradient(180deg, rgb(54 86 255), rgb(11 9 169))
			)
			center / 100% 100% no-repeat;
	}

	.theme-cip-slender
		.theme-cip-slender__image-button--medium.theme-cip-slender__image-button--rendered:hover,
	.theme-cip-slender
		.theme-cip-slender__image-button--medium.theme-cip-slender__image-button--rendered:focus {
		background: transparent;
	}

	.theme-cip-slender .theme-cip-slender__image-button img {
		display: block;
		max-width: 100%;
		height: auto;
	}

	.theme-cip-slender .theme-cip-slender__create-account-link {
		display: flex;
		width: 150px;
		min-height: 17px;
		align-items: center;
		justify-content: center;
		border: 0;
		background: transparent;
		color: rgb(221 206 167);
		cursor: pointer;
		font-size: 11px;
		line-height: 1;
		text-decoration: none;
	}

	.theme-cip-slender
		.theme-cip-slender__create-account-link--loginbox {
		min-height: 11px;
		align-items: flex-start;
	}

	.theme-cip-slender .theme-cip-slender__create-account-link img {
		display: block;
		max-width: 124px;
		height: auto;
	}

	.theme-cip-slender
		.theme-cip-slender__create-account-link--loginbox
		img:not(.theme-cip-slender__create-account-link-fallback) {
		width: 124px;
		height: 11px;
		object-fit: contain;
	}

	.theme-cip-slender .theme-cip-slender__image-button:hover img,
	.theme-cip-slender .theme-cip-slender__image-button:focus img {
		filter: brightness(1.15);
	}

	.theme-cip-slender .theme-cip-slender__center-chrome {
		position: relative;
		border: 0;
		background:
			var(--cip-info-frame-edge, none) left top 4px / 5px 5px no-repeat,
			var(--cip-info-frame-edge, none) right top 4px / 5px 5px no-repeat,
			var(--cip-info-frame-edge, none) left bottom 4px / 5px 5px no-repeat,
			var(--cip-info-frame-edge, none) right bottom 4px / 5px 5px no-repeat,
			var(--cip-info-frame-vertical, none) left top 5px / 3px 13px repeat-y,
			var(--cip-info-frame-vertical, none) right top 5px / 3px 13px repeat-y,
			var(--cip-content-border, none)
				var(--cip-center-chrome-top-border-position, -1px 0) / 16px 6px
				repeat-x,
			var(--cip-content-border, none)
				var(--cip-center-chrome-bottom-border-position, -1px bottom) / 16px
				6px repeat-x,
			var(--cip-center-chrome-fill, rgb(35 35 34));
	}

	.theme-cip-slender .theme-cip-slender__center-chrome::before,
	.theme-cip-slender .theme-cip-slender__center-chrome::after {
		position: absolute;
		left: -4px;
		width: calc(100% + 8px);
		height: 17px;
		background-repeat: no-repeat;
		background-size: 17px 17px, 17px 17px;
		content: '';
		pointer-events: none;
		z-index: 3;
	}

	.theme-cip-slender .theme-cip-slender__center-chrome::before {
		top: -4px;
		background-image:
			var(--cip-info-corner-tl, none),
			var(--cip-info-corner-tr, none);
		background-position:
			left top,
			right top;
	}

	.theme-cip-slender .theme-cip-slender__center-chrome::after {
		bottom: -4px;
		background-image:
			var(--cip-info-corner-bl, none),
			var(--cip-info-corner-br, none);
		background-position:
			left top,
			right top;
	}

	.theme-cip-slender .theme-cip-slender__topbar {
		position: relative;
		box-sizing: border-box;
		display: flex;
		width: 865px;
		max-width: 100%;
		height: 40px;
		min-height: 40px;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0;
		margin-left: 2px;
		padding: 12px 6px 0 7px;
		--cip-center-chrome-fill:
			linear-gradient(rgb(93 14 10), rgb(93 14 10)) 0 6px / 4px 28px no-repeat,
			var(--cip-cache-title, var(--cip-news-headline, none)) -2px 6px / 83px
				28px repeat-x,
			rgb(93 14 10);
		box-shadow: none;
		color: rgb(242 226 195);
		font-family: Verdana, Arial, Helvetica, sans-serif;
		font-size: 10px;
		font-weight: 700;
		line-height: 1;
	}

	.theme-cip-slender .theme-cip-slender__topbar.theme-cip-slender__center-chrome::before,
	.theme-cip-slender .theme-cip-slender__topbar.theme-cip-slender__center-chrome::after {
		left: -3px;
		width: calc(100% + 7px);
	}

	.theme-cip-slender .theme-cip-slender__topbar.theme-cip-slender__center-chrome::after {
		left: -4px;
		width: calc(100% + 8px);
	}

	.theme-cip-slender .theme-cip-slender__ticker {
		position: relative;
		--cip-center-chrome-fill: rgb(35 35 34);
		margin-top: 10px;
		margin-bottom: 8px;
		padding: 4px 5px;
		box-shadow: 0 8px 22px rgb(0 0 0 / 0.35);
	}

	.theme-cip-slender .theme-cip-slender__ticker header {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 28px;
		padding: 0 10px;
		border: 0;
		background:
			var(--cip-content-title, none) repeat-x,
			linear-gradient(180deg, rgb(31 74 23), rgb(20 48 16));
		color: rgb(240 224 178);
	}

	.theme-cip-slender .theme-cip-slender__ticker header img {
		width: 16px;
		height: 16px;
	}

	.theme-cip-slender
		.theme-cip-slender__ticker
		header
		.theme-cip-slender__headline-image {
		width: 250px;
		height: 24px;
		object-fit: contain;
	}

	.theme-cip-slender .theme-cip-slender__ticker h2 {
		margin: 0;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 25px;
		font-weight: 800;
		line-height: 1;
		text-shadow:
			1px 1px 0 rgb(0 0 0),
			0 0 8px rgb(0 0 0 / 0.75);
	}

	.theme-cip-slender .theme-cip-slender__ticker-body {
		padding: 5px 6px 6px;
		background:
			linear-gradient(rgb(247 225 184 / 0.97), rgb(233 198 142 / 0.97)),
			rgb(241 213 169);
	}

	.theme-cip-slender .theme-cip-slender__ticker-body a {
		position: relative;
		display: flex;
		align-items: center;
		gap: 5px;
		overflow: hidden;
		height: 21px;
		padding: 2px 22px 2px 6px;
		border: 1px solid rgb(177 126 61);
		background:
			linear-gradient(90deg, rgb(255 247 205 / 0.78), rgb(239 194 128 / 0.76)),
			rgb(242 210 155);
		color: rgb(79 38 13);
		font-size: 13px;
		line-height: 16px;
		text-decoration: none;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.theme-cip-slender .theme-cip-slender__ticker-body a::after {
		position: absolute;
		top: 50%;
		right: 5px;
		width: 12px;
		height: 12px;
		transform: translateY(-50%);
		background: var(--cip-ticker-expand, none) center / contain no-repeat;
		content: '';
	}

	.theme-cip-slender .theme-cip-slender__ticker-body a > img {
		width: 16px;
		height: 16px;
		flex: 0 0 16px;
	}

	.theme-cip-slender .theme-cip-slender__ticker-body a + a {
		margin-top: 2px;
	}

	.theme-cip-slender .theme-cip-slender__ticker-body span {
		margin-right: 6px;
		color: rgb(91 49 21);
	}

	.theme-cip-slender .theme-cip-slender__ticker-body strong {
		color: rgb(0 55 125);
	}

	.theme-cip-slender .theme-cip-slender__links,
	.theme-cip-slender .theme-cip-slender__status {
		display: flex;
		align-items: center;
		gap: 0;
		min-width: 0;
		height: 16px;
		position: relative;
		z-index: 2;
	}

	.theme-cip-slender .theme-cip-slender__links {
		flex: 1 1 auto;
	}

	.theme-cip-slender .theme-cip-slender__info-item,
	.theme-cip-slender .theme-cip-slender__players-online {
		display: flex;
		align-items: center;
		height: 16px;
		gap: 0;
		color: rgb(255 245 222);
		font-family: Verdana, Arial, Helvetica, sans-serif;
		font-size: 10px;
		font-weight: 700;
		line-height: 16px;
		letter-spacing: 0;
		text-decoration: none;
		text-shadow:
			1px 1px 0 rgb(0 0 0),
			0 0 4px rgb(0 0 0 / 0.9);
		white-space: nowrap;
	}

	.theme-cip-slender .theme-cip-slender__info-item:hover,
	.theme-cip-slender .theme-cip-slender__players-online:hover {
		color: white;
		text-decoration: none;
	}

	.theme-cip-slender .theme-cip-slender__info-item > img {
		display: block;
		width: auto;
		height: 16px;
		margin-right: 1px;
	}

	.theme-cip-slender .theme-cip-slender__info-item > svg {
		width: 16px;
		height: 16px;
		margin-right: 2px;
	}

	.theme-cip-slender .theme-cip-slender__info-item--youtube {
		margin-left: 6px;
	}

	.theme-cip-slender .theme-cip-slender__info-item--download {
		margin-left: 8px;
	}

	.theme-cip-slender .theme-cip-slender__info-item--download > img {
		margin-right: 2px;
	}

	.theme-cip-slender .theme-cip-slender__info-watch {
		position: relative;
		display: inline-block;
		width: 10px;
		height: 7px;
		margin: 0 2px;
		border-radius: 50%;
		background: rgb(245 239 225);
		box-shadow: 1px 1px 0 rgb(0 0 0 / 0.85);
	}

	.theme-cip-slender .theme-cip-slender__info-watch::after {
		position: absolute;
		top: 2px;
		left: 4px;
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: rgb(72 21 15);
		content: '';
	}

	.theme-cip-slender .theme-cip-slender__footer a {
		color: rgb(252 231 177);
		text-decoration: none;
	}

	.theme-cip-slender .theme-cip-slender__footer a:hover {
		color: white;
		text-decoration: underline;
	}

	.theme-cip-slender .theme-cip-slender__status {
		flex: 0 0 auto;
		margin-left: auto;
		padding-top: 0;
		color: rgb(255 237 202);
		font-weight: 700;
		text-shadow: 1px 1px 0 rgb(0 0 0);
	}

	.theme-cip-slender .theme-cip-slender__players-online {
		gap: 0;
	}

	.theme-cip-slender .theme-cip-slender__players-online img {
		display: block;
		width: 11px;
		height: 14px;
		margin-right: 4px;
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
		color: rgb(255 244 218);
		font-size: 12px;
		text-align: center;
		text-shadow: 1px 1px 2px rgb(0 0 0);
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

	.theme-cip-slender .theme-cip-slender__right-spacer {
		position: relative;
		display: flex;
		height: 140px;
		align-items: flex-end;
		justify-content: center;
	}

	.theme-cip-slender .theme-cip-slender__theme-switch {
		position: absolute;
		top: 10px;
		right: -92px;
		z-index: 6;
		display: inline-flex;
		width: 82px;
		height: 20px;
		align-items: center;
		justify-content: center;
		border: 1px solid rgb(92 73 51);
		background: rgb(15 22 31 / 0.86);
		color: rgb(246 225 166);
		font-size: 10px;
		font-weight: 700;
		line-height: 1;
		text-decoration: none;
		text-shadow: 1px 1px 0 rgb(0 0 0);
	}

	.theme-cip-slender .theme-cip-slender__theme-switch:hover,
	.theme-cip-slender .theme-cip-slender__theme-switch:focus {
		border-color: rgb(180 142 76);
		background: rgb(52 30 18 / 0.92);
		color: white;
	}

	.theme-cip-slender .theme-cip-slender__pedestal {
		display: block;
		max-width: 161px;
		height: auto;
		transform: translateY(15px);
	}

	.theme-cip-slender .theme-cip-slender__right-boost {
		position: absolute;
		bottom: 30px;
		z-index: 2;
		width: 46px;
		height: 42px;
		transform: translateY(15px);
		pointer-events: auto;
	}

	.theme-cip-slender .theme-cip-slender__right-boost--creature {
		left: 29px;
	}

	.theme-cip-slender .theme-cip-slender__right-boost--boss {
		right: 29px;
	}

	.theme-cip-slender .theme-cip-slender__right-boost > img {
		position: absolute;
		top: -12px;
		left: -9px;
		z-index: 1;
		width: 64px;
		height: 64px;
		object-fit: contain;
	}

	:global(.theme-cip-slender .theme-cip-slender__boosted-avatar) {
		z-index: 2;
		width: 46px;
		height: 42px;
		overflow: visible;
	}

	:global(.theme-cip-slender .theme-cip-slender__boosted-avatar-inner) {
		left: -18px !important;
		bottom: -16px !important;
	}

	:global(.theme-cip-slender .theme-cip-slender__boosted-avatar canvas) {
		width: 72px !important;
		height: 72px !important;
	}

	.theme-cip-slender .theme-cip-slender__characters {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.theme-cip-slender .theme-cip-slender__characters a {
		display: grid;
		grid-template-columns: 24px 38px minmax(0, 1fr);
		align-items: center;
		gap: 4px;
		min-height: 44px;
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

	.theme-cip-slender .theme-cip-slender__compact-characters {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.theme-cip-slender .theme-cip-slender__compact-characters a {
		display: grid;
		grid-template-columns: 22px minmax(0, 1fr);
		grid-template-rows: auto auto;
		column-gap: 8px;
		min-height: 34px;
		align-items: center;
		color: rgb(242 226 195);
		text-decoration: none;
	}

	.theme-cip-slender
		.theme-cip-slender__compact-characters
		.theme-cip-slender__rank {
		grid-row: 1 / 3;
	}

	.theme-cip-slender .theme-cip-slender__compact-characters strong,
	.theme-cip-slender .theme-cip-slender__compact-characters small {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.theme-cip-slender .theme-cip-slender__compact-characters small {
		color: rgb(213 185 139);
		font-size: 10px;
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

	.theme-cip-slender .theme-cip-slender__promo {
		position: relative;
		display: block;
		margin: -10px;
		overflow: hidden;
		text-decoration: none;
	}

	.theme-cip-slender .theme-cip-slender__promo img {
		display: block;
		width: 100%;
		height: auto;
	}

	.theme-cip-slender .theme-cip-slender__promo--network,
	.theme-cip-slender .theme-cip-slender__promo--media,
	.theme-cip-slender .theme-cip-slender__promo--screenshot,
	.theme-cip-slender .theme-cip-slender__promo--poll {
		min-height: 92px;
	}

	.theme-cip-slender .theme-cip-slender__network-links {
		position: absolute;
		inset: 20px 12px auto;
		display: flex;
		justify-content: center;
		gap: 5px;
	}

	.theme-cip-slender .theme-cip-slender__network-links a {
		display: flex;
		width: 42px;
		min-height: 42px;
		align-items: center;
		justify-content: center;
		border: 1px solid rgb(141 95 44);
		background:
			linear-gradient(rgb(255 245 213 / 0.82), rgb(206 164 98 / 0.82)),
			rgb(221 189 132);
		color: rgb(44 27 17);
		font-size: 0;
		text-decoration: none;
		box-shadow:
			inset 0 0 0 1px rgb(255 255 255 / 0.4),
			0 2px 4px rgb(0 0 0 / 0.35);
	}

	.theme-cip-slender .theme-cip-slender__network-links a:hover {
		filter: brightness(1.12);
	}

	.theme-cip-slender .theme-cip-slender__network-links svg {
		width: 22px;
		height: 22px;
	}

	.theme-cip-slender .theme-cip-slender__promo--media {
		background: rgb(22 16 12);
	}

	.theme-cip-slender .theme-cip-slender__promo--media > img:first-child {
		position: absolute;
		top: 0;
		left: 0;
	}

	.theme-cip-slender .theme-cip-slender__media-preview {
		position: absolute;
		inset: 18px 8px 8px;
		width: calc(100% - 16px) !important;
		height: 72px !important;
		border: 1px solid rgb(24 20 18);
		object-fit: cover;
		filter: saturate(0.95) contrast(1.08);
	}

	.theme-cip-slender .theme-cip-slender__play-mark {
		position: absolute;
		top: 48px;
		left: 50%;
		width: 38px;
		height: 26px;
		transform: translate(-50%, -50%);
		border: 2px solid rgb(255 255 255 / 0.88);
		border-radius: 5px;
		background: rgb(176 24 24 / 0.84);
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.65);
	}

	.theme-cip-slender .theme-cip-slender__play-mark::before {
		position: absolute;
		top: 50%;
		left: 52%;
		width: 0;
		height: 0;
		transform: translate(-45%, -50%);
		border-top: 7px solid transparent;
		border-bottom: 7px solid transparent;
		border-left: 11px solid white;
		content: '';
	}

	.theme-cip-slender .theme-cip-slender__screenshot-frame {
		position: absolute;
		inset: 17px 5px 5px;
		background-position: center;
		background-repeat: no-repeat;
		background-size: 100% 100%;
	}

	.theme-cip-slender .theme-cip-slender__screenshot-frame img {
		position: absolute;
		top: 8px;
		left: 8px;
		width: calc(100% - 16px) !important;
		height: calc(100% - 16px) !important;
		object-fit: cover;
	}

	.theme-cip-slender .theme-cip-slender__poll-copy {
		position: absolute;
		inset: 36px 16px auto;
		display: flex;
		flex-direction: column;
		gap: 3px;
		align-items: center;
		color: rgb(87 43 16);
		font-size: 12px;
		line-height: 1.15;
		text-align: center;
		text-shadow: 0 1px 0 rgb(255 241 209);
	}

	.theme-cip-slender .theme-cip-slender__official-box {
		position: relative;
		display: block;
		width: 180px;
		overflow: hidden;
		color: rgb(242 226 195);
		text-decoration: none;
	}

	.theme-cip-slender .theme-cip-slender__official-box > img:first-child {
		display: block;
		width: 180px;
		height: auto;
	}

	.theme-cip-slender .theme-cip-slender__official-box--premium {
		overflow: visible;
		height: 204px;
	}

	.theme-cip-slender .theme-cip-slender__official-box--network {
		height: 104px;
	}

	.theme-cip-slender .theme-cip-slender__official-box--trailer {
		height: 153px;
		background: rgb(14 12 11 / 0.86);
	}

	.theme-cip-slender .theme-cip-slender__official-box--screenshot {
		height: 154px;
		background: rgb(14 12 11 / 0.86);
	}

	.theme-cip-slender .theme-cip-slender__official-box--poll {
		height: 143px;
	}

	.theme-cip-slender .theme-cip-slender__premium-art {
		position: absolute;
		top: 53px;
		left: 11px;
		display: flex;
		width: 154px;
		height: 82px;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: transparent;
	}

	.theme-cip-slender .theme-cip-slender__premium-art img {
		display: block;
		width: 154px;
		height: 82px;
		object-fit: cover;
	}

	.theme-cip-slender .theme-cip-slender__premium-offer {
		position: absolute;
		top: 38px;
		right: 8px;
		left: 8px;
		z-index: 2;
		display: block;
		color: white;
		font-family: Verdana, Arial, sans-serif;
		font-size: 11px;
		font-weight: 800;
		line-height: 14px;
		text-align: center;
		text-shadow:
			1px 1px 0 rgb(0 0 0),
			0 0 4px rgb(0 0 0 / 0.9);
	}

	.theme-cip-slender .theme-cip-slender__premium-button {
		position: absolute;
		right: 19px;
		bottom: 8px;
		left: 19px;
		display: flex;
		height: 34px;
		align-items: center;
		justify-content: center;
		color: rgb(255 242 82);
		font-family: Verdana, Arial, sans-serif;
		font-size: 11px;
		font-weight: 800;
		line-height: 1;
		text-align: center;
		text-shadow:
			1px 1px 0 rgb(0 0 0),
			-1px -1px 0 rgb(0 0 0),
			0 0 5px rgb(0 0 0 / 0.8);
		background: var(--cip-premium-button, rgb(19 25 142)) center / 142px 34px
			no-repeat;
	}

	.theme-cip-slender
		.theme-cip-slender__official-box--premium:hover
		.theme-cip-slender__premium-button {
		background-image: var(
			--cip-premium-button-hover,
			var(--cip-premium-button)
		);
	}

	.theme-cip-slender .theme-cip-slender__premium-button span {
		display: block;
		transform: translateY(-1px);
	}

	.theme-cip-slender .theme-cip-slender__network-links {
		position: absolute;
		right: 0;
		bottom: 15px;
		left: 0;
		display: flex;
		justify-content: center;
		gap: 8px;
	}

	.theme-cip-slender .theme-cip-slender__network-links a,
	.theme-cip-slender .theme-cip-slender__network-links img {
		display: block;
		width: 30px;
		height: 30px;
	}

	.theme-cip-slender .theme-cip-slender__trailer-preview {
		position: absolute;
		top: 35px;
		left: 5px;
		width: 170px !important;
		height: 110px !important;
	}

	.theme-cip-slender .theme-cip-slender__screenshot-frame {
		position: absolute;
		top: 36px;
		left: 5px;
		width: 170px;
		height: 110px;
		background-position: center;
		background-repeat: no-repeat;
		background-size: 170px 110px;
	}

	.theme-cip-slender .theme-cip-slender__screenshot-frame img {
		position: absolute;
		top: 8px;
		left: 8px;
		width: 154px !important;
		height: 94px !important;
		object-fit: cover;
	}

	:global(.theme-cip-slender .theme-cip-slender__box-button) {
		margin-top: 8px;
		width: 100%;
		border: 1px solid rgb(238 209 64);
		background: linear-gradient(180deg, rgb(25 53 229), rgb(12 8 136));
		color: rgb(255 239 75);
		font-weight: 800;
		text-shadow: 1px 1px 0 rgb(0 0 0);
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

	.theme-cip-slender
		:global(.theme-cip-slender-content-frame__paper > .w-full) {
		color: rgb(83 43 16);
		font-family: Verdana, Arial, sans-serif;
		font-size: 13px;
		line-height: 1.42;
	}

	.theme-cip-slender
		:global(.theme-cip-slender-content-frame__paper > .w-full > header.card) {
		position: relative;
		margin: 0 0 14px;
		min-height: 28px;
		padding-left: 34px;
		border: 1px solid rgb(80 12 8);
		border-radius: 0;
		background:
			var(--cip-news-headline, none) repeat-x,
			linear-gradient(180deg, rgb(153 24 16), rgb(84 12 8));
		color: rgb(255 244 210);
		box-shadow:
			inset 0 0 0 1px rgb(255 214 127 / 0.18),
			0 1px 0 rgb(255 255 255 / 0.25);
		font-size: 13px;
		text-shadow: 1px 1px 0 rgb(0 0 0);
	}

	.theme-cip-slender
		:global(
			.theme-cip-slender-content-frame__paper > .w-full > header.card::before
		) {
		position: absolute;
		top: 50%;
		left: 9px;
		width: 16px;
		height: 16px;
		transform: translateY(-50%);
		background: var(--cip-news-icon, none) center / contain no-repeat;
		content: '';
	}

	.theme-cip-slender
		:global(
			.theme-cip-slender-content-frame__paper > .w-full > header.card svg
		) {
		display: none;
	}

	.theme-cip-slender
		:global(
			.theme-cip-slender-content-frame__paper > .w-full > header.card strong
		) {
		color: white;
	}

	.theme-cip-slender
		:global(.theme-cip-slender-content-frame__paper > .w-full p) {
		margin: 10px 10px 14px;
	}

	.theme-cip-slender
		:global(
			.theme-cip-slender-content-frame__paper
				> .w-full
				> p:first-of-type::first-letter
		) {
		float: left;
		margin: 0 6px 0 0;
		color: rgb(113 19 12);
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 34px;
		font-weight: 700;
		line-height: 0.85;
		text-shadow: 0 1px 0 rgb(255 245 207);
	}

	.theme-cip-slender
		:global(.theme-cip-slender-content-frame__paper .news-empty) {
		color: rgb(83 43 16);
		font-family: Verdana, Arial, sans-serif;
	}

	.theme-cip-slender
		:global(.theme-cip-slender-content-frame__paper .news-empty header.card) {
		position: relative;
		margin: 0 0 14px;
		min-height: 28px;
		padding-left: 34px;
		border: 1px solid rgb(80 12 8);
		border-radius: 0;
		background:
			var(--cip-news-headline, none) repeat-x,
			linear-gradient(180deg, rgb(153 24 16), rgb(84 12 8));
		color: rgb(255 244 210);
		box-shadow: inset 0 0 0 1px rgb(255 214 127 / 0.18);
		text-shadow: 1px 1px 0 rgb(0 0 0);
	}

	.theme-cip-slender
		:global(
			.theme-cip-slender-content-frame__paper .news-empty header.card::before
		) {
		position: absolute;
		top: 50%;
		left: 9px;
		width: 16px;
		height: 16px;
		transform: translateY(-50%);
		background: var(--cip-news-icon, none) center / contain no-repeat;
		content: '';
	}

	.theme-cip-slender
		:global(
			.theme-cip-slender-content-frame__paper .news-empty header.card svg
		) {
		display: none;
	}

	.theme-cip-slender
		:global(.theme-cip-slender-content-frame__paper .news-empty p) {
		margin: 18px 10px 0;
		max-width: 620px;
		color: rgb(78 39 14);
		line-height: 1.48;
	}

	.theme-cip-slender
		:global(
			.theme-cip-slender-content-frame__paper .news-empty p::first-letter
		) {
		float: left;
		margin: 0 6px 0 0;
		color: rgb(113 19 12);
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 34px;
		font-weight: 700;
		line-height: 0.85;
		text-shadow: 0 1px 0 rgb(255 245 207);
	}

	.theme-cip-slender
		:global(.theme-cip-slender-content-frame__paper > .w-full .divider) {
		border-color: rgb(160 112 58);
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
