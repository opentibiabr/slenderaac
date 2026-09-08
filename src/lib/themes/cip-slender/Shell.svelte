<script lang="ts">
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	import {
		faBars,
		faBookBookmark,
		faToolbox,
	} from '@fortawesome/free-solid-svg-icons';
	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';

	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';

	import type { InformationPresentation } from '$lib/information-content';
	import { themePreviewHref } from '$lib/themes/preview';

	import {
		PUBLIC_DOWNLOAD_URL,
		PUBLIC_TITLE,
		PUBLIC_WIKI_URL,
	} from '$env/static/public';

	import type { LayoutData } from '../../../routes/(app)/$types';
	import type { CipNewsReference } from './reference-types';
	import ContentFrame from './ContentFrame.svelte';
	import InfoBar from './InfoBar.svelte';
	import { cipLayoutForPath } from './layout';
	import Menu from './Menu.svelte';
	import { cipAsset } from './theme';

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

	type CipSlenderNewsArticle = {
		id: number | string;
		title: string;
		created_at: Date | string;
		content?: string | null;
		category?: string;
	};

	type CipSlenderTickerSegment = {
		text: string;
		kind: 'text' | 'link';
		href?: string;
	};

	type CipSlenderTickerItem = {
		id: string;
		href: string;
		date: string;
		title: string;
		copySegments: CipSlenderTickerSegment[];
		icon: string;
	};

	const cipTickerMonths = [
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

	const drawerStore = getDrawerStore();

	export let data: CipSlenderLayoutData;
	let tickerUrl = '';
	let expandedTickers: boolean[] = [];
	$: ({ isLoggedIn, isAdmin } = data);
	$: cipReference = ($page.data as { cipReference?: CipNewsReference | null })
		.cipReference;
	$: title = typeof $page.data.title === 'string' ? $page.data.title : '';
	$: information = (
		$page.data as { informationPresentation?: InformationPresentation | null }
	).informationPresentation;
	$: isInformationPage = !!$page.data.informationPage;
	$: currentPath = $page.url.pathname.replace(/\/$/, '') || '/';
	$: layout = cipLayoutForPath(currentPath);
	$: isNewsArchivePage = currentPath === '/news/archive';
	$: isEventSchedulePage = layout === 'compact-wide';
	$: isCompactNewsToolPage = layout !== 'news';
	$: showNewsTicker = !isCompactNewsToolPage && tickerItems.length > 0;
	$: showAuxiliaryThemeboxes = !isCompactNewsToolPage;
	$: showCipGrid = $page.url.searchParams.get('cipGrid') === '1';
	$: themeSwitchHref = (() => {
		const nextUrl = new URL($page.url.href);
		nextUrl.searchParams.set('themePreview', 'legbone');
		nextUrl.searchParams.delete('cipGrid');

		return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
	})();
	$: homeHref = makeCipPreviewHref($page.url, '/');
	$: accountHref = makeCipPreviewHref($page.url, '/account');
	$: accountLoginHref = makeCipPreviewHref($page.url, '/account/login');
	$: accountSignupHref = makeCipPreviewHref($page.url, '/account/signup');
	$: onlineHref = makeCipPreviewHref($page.url, '/online');
	$: shopHref = makeCipPreviewHref($page.url, '/shop');
	$: presentation = data.cipPresentation;
	$: fansitesHref = presentationHref(
		'fansites',
		'https://www.tibia.com/community/?subtopic=fansites',
	);

	function presentationHref(key: string, fallback: string): string {
		return themePreviewHref($page.url, presentation?.links[key] ?? fallback);
	}
	$: tickerPageArticles = getTickerArticles($page.data.tickers);
	$: tickerItems = (
		cipReference
			? cipReference.ticker.map((item, index) => ({
					id: String(index),
					href: homeHref,
					date: item.date,
					title: '',
					copySegments: makeTickerTextSegments(item.text),
					icon: item.icon,
				}))
			: tickerPageArticles.map((article) => ({
					id: String(article.id),
					href: makeCipPreviewHref($page.url, `/?ticker=${article.id}`),
					date: `${formatCipTickerDate(article.created_at)} -`,
					title: '',
					copySegments: makeTickerSummarySegments(article),
					icon: tickerCategoryIcon(article.category),
				}))
	) satisfies CipSlenderTickerItem[];
	$: if (tickerUrl !== $page.url.href) {
		tickerUrl = $page.url.href;
		expandedTickers = tickerItems.map(
			(item) => $page.url.searchParams.get('ticker') === item.id,
		);
	}
	function tickerCategoryIcon(category?: string): string {
		const keys = {
			cipsoft: 'newsArchiveIconCipsoft',
			community: 'newsArchiveIconCommunity',
			development: 'newsArchiveIconDevelopment',
			support: 'newsArchiveIconSupport',
			technical: 'newsArchiveIconTechnical',
		} as const;
		return (
			cipAsset(
				data.themeAssets,
				keys[category as keyof typeof keys] ?? keys.community,
			) ?? ''
		);
	}
	$: staticPages = data.staticPages;
	$: logo = cipAsset(data.themeAssets, 'logo');
	$: background = cipAsset(data.themeAssets, 'background');
	$: menuOrnament = cipAsset(data.themeAssets, 'menuOrnament');
	$: contentOrnament = cipAsset(data.themeAssets, 'contentOrnament');
	$: topIconTwitch = cipAsset(data.themeAssets, 'topIconTwitch');
	$: topIconYoutube = cipAsset(data.themeAssets, 'topIconYoutube');
	$: topIconDownload = cipAsset(data.themeAssets, 'topIconDownload');
	$: topIconOnline = cipAsset(data.themeAssets, 'topIconOnline');
	$: topIconSignal = cipAsset(data.themeAssets, 'topIconSignal');
	$: topIconEye = cipAsset(data.themeAssets, 'topIconEye');
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
	$: contentCornerTopLeftClean = cipAsset(
		data.themeAssets,
		'contentCornerTopLeftClean',
	);
	$: contentCornerTopRightClean = cipAsset(
		data.themeAssets,
		'contentCornerTopRightClean',
	);
	$: contentCornerBottomLeftClean = cipAsset(
		data.themeAssets,
		'contentCornerBottomLeftClean',
	);
	$: contentCornerBottomRightClean = cipAsset(
		data.themeAssets,
		'contentCornerBottomRightClean',
	);
	$: contentBorder = cipAsset(data.themeAssets, 'contentBorder');
	$: paperTexture = cipAsset(data.themeAssets, 'paperTexture');
	$: newsHeadlineBackground = cipAsset(
		data.themeAssets,
		'newsHeadlineBackground',
	);
	$: headlineNewsTicker = cipAsset(data.themeAssets, 'headlineNewsTicker');
	$: headlineNews = cipAsset(data.themeAssets, 'headlineNews');
	$: headlineNewsArchive = cipAsset(data.themeAssets, 'headlineNewsArchive');
	$: headlineEventSchedule = cipAsset(
		data.themeAssets,
		'headlineEventSchedule',
	);
	$: newsTickerIconCommunity = cipAsset(
		data.themeAssets,
		'newsTickerIconCommunity',
	);
	$: newsTickerIconDevelopment = cipAsset(
		data.themeAssets,
		'newsTickerIconDevelopment',
	);
	$: newsHeadlineIcon =
		cipReference?.assets.newsHeadlineIcon ??
		cipAsset(data.themeAssets, 'newsHeadlineIcon');
	$: tickerExpandIcon = cipAsset(data.themeAssets, 'menuExpandPlus');
	$: tickerCollapseIcon = cipAsset(data.themeAssets, 'menuExpandMinus');
	$: boxTop = cipAsset(data.themeAssets, 'boxTop');
	$: boxBottom = cipAsset(data.themeAssets, 'boxBottom');
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
		contentCornerTopLeftClean
			? `--cip-ticker-corner-tl: url("${contentCornerTopLeftClean}")`
			: '',
		contentCornerTopRightClean
			? `--cip-ticker-corner-tr: url("${contentCornerTopRightClean}")`
			: '',
		contentCornerBottomLeftClean
			? `--cip-ticker-corner-bl: url("${contentCornerBottomLeftClean}")`
			: '',
		contentCornerBottomRightClean
			? `--cip-ticker-corner-br: url("${contentCornerBottomRightClean}")`
			: '',
		tickerExpandIcon ? `--cip-ticker-expand: url("${tickerExpandIcon}")` : '',
		tickerCollapseIcon
			? `--cip-ticker-collapse: url("${tickerCollapseIcon}")`
			: '',
		contentBorder ? `--cip-content-border: url("${contentBorder}")` : '',
	]
		.filter(Boolean)
		.join('; ');
	$: promoPremiumBox = cipAsset(data.themeAssets, 'promoPremiumBox');
	$: premiumPromoArt =
		cipReference?.assets.premiumPromoArt ??
		cipAsset(data.themeAssets, 'premiumPromoArt');
	$: premiumCrown =
		cipReference?.assets.premiumCrown ??
		cipAsset(data.themeAssets, 'premiumCrown');
	$: premiumOverlay = cipAsset(data.themeAssets, 'premiumOverlay');
	$: premiumButtonLabel = cipAsset(data.themeAssets, 'shopButton');
	$: premiumButtonDecor =
		cipAsset(data.themeAssets, 'premiumButtonDecor') ??
		cipAsset(data.themeAssets, 'premiumButtonPremiumTime');
	$: premiumOfferText =
		cipReference?.premiumText ??
		presentation?.premiumText ??
		(isNewsArchivePage ? 'Access ALL Areas!' : 'Get Supplies Anywhere!');
	$: premiumButtonText =
		cipReference?.premiumButtonText ??
		presentation?.premiumButtonText ??
		(isNewsArchivePage ? 'Get Premium' : 'Get Tibia Coins');
	$: premiumButtonBackground = cipAsset(
		data.themeAssets,
		'premiumButtonBackground',
	);
	$: premiumButtonHover = cipAsset(data.themeAssets, 'premiumButtonHover');
	$: promoFansitesBox = cipAsset(data.themeAssets, 'promoFansitesBox');
	$: fansiteLogoFrame = cipAsset(data.themeAssets, 'fansiteLogoFrame');
	$: fansiteLogo = cipAsset(data.themeAssets, 'fansiteLogo');
	$: fansiteButtonBackground = cipAsset(
		data.themeAssets,
		'fansiteButtonBackground',
	);
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
	$: fansitesBoxStyle = [
		fansiteLogoFrame
			? `--cip-fansites-logo-frame: url("${fansiteLogoFrame}")`
			: '',
		fansiteButtonBackground
			? `--cip-fansites-button: url("${fansiteButtonBackground}")`
			: '',
	]
		.filter(Boolean)
		.join('; ');
	$: pollBoxStyle = [
		smallButtonBackground
			? `--cip-poll-button: url("${smallButtonBackground}")`
			: '',
		smallButtonHover
			? `--cip-poll-button-hover: url("${smallButtonHover}")`
			: '',
		boxBottom ? `--cip-poll-bottom: url("${boxBottom}")` : '',
	]
		.filter(Boolean)
		.join('; ');
	$: shellStyle = [
		isInformationPage
			? `--cip-center-minimum: ${($page.data.informationPage?.minimumBodyWidth ?? 0) + 34}px`
			: '',
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
		topIconSignal ? `--cip-top-icon-signal: url("${topIconSignal}")` : '',
		topIconEye ? `--cip-top-icon-eye: url("${topIconEye}")` : '',
		newsHeadlineIcon ? `--cip-news-icon: url("${newsHeadlineIcon}")` : '',
		boxBottom ? `--cip-right-themebox-bottom: url("${boxBottom}")` : '',
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
	$: promoScreenshotImage =
		cipReference?.assets.promoScreenshotImage ??
		cipAsset(data.themeAssets, 'promoScreenshotImage');
	$: promoPollBox = cipAsset(data.themeAssets, 'promoPollBox');
	$: rightTopper = cipAsset(data.themeAssets, 'rightTopper');
	$: rightCreature =
		cipReference?.assets.rightCreature ??
		cipAsset(data.themeAssets, 'rightCreature');
	$: rightBoss =
		cipReference?.assets.rightBoss ?? cipAsset(data.themeAssets, 'rightBoss');

	function drawerOpen(): void {
		drawerStore.open({});
	}
	function drawerClose(): void {
		drawerStore.close();
	}

	function isTickerArticle(value: unknown): value is CipSlenderNewsArticle {
		if (typeof value !== 'object' || value === null) {
			return false;
		}

		const article = value as Partial<CipSlenderNewsArticle>;

		return (
			(typeof article.id === 'number' || typeof article.id === 'string') &&
			typeof article.title === 'string' &&
			(article.created_at instanceof Date ||
				typeof article.created_at === 'string')
		);
	}

	function getTickerArticles(value: unknown): CipSlenderNewsArticle[] {
		return Array.isArray(value)
			? value.filter(isTickerArticle).slice(0, 5)
			: [];
	}

	function formatCipTickerDate(value: Date | string): string {
		const date = value instanceof Date ? value : new Date(value);

		if (!Number.isFinite(date.getTime())) {
			return '';
		}

		return `${cipTickerMonths[date.getUTCMonth()]} ${String(
			date.getUTCDate(),
		).padStart(2, '0')} ${date.getUTCFullYear()}`;
	}

	function makeTickerSummarySegments(
		article: CipSlenderNewsArticle,
	): CipSlenderTickerSegment[] {
		return typeof article.content === 'string'
			? summarizeTickerSegments(article.content)
			: [];
	}

	function summarizeTickerSegments(value: string): CipSlenderTickerSegment[] {
		return makeTickerTextSegments(
			value
				.replace(/```[\s\S]*?```/g, ' ')
				.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
				.replace(/^\s*[-*+]\s+/gm, '')
				.replace(/\s+/g, ' ')
				.trim(),
		);
	}

	function makeTickerTextSegments(value: string): CipSlenderTickerSegment[] {
		const linkPattern =
			/\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s)]+|www\.[^\s)]+)/g;
		const segments: CipSlenderTickerSegment[] = [];
		const cleanValue = value.trim();
		let lastIndex = 0;

		for (const match of cleanValue.matchAll(linkPattern)) {
			const index = match.index ?? 0;
			pushTickerSegment(segments, cleanValue.slice(lastIndex, index), 'text');
			const href = match[2] ?? match[3];
			const safeHref = /^(https?:\/\/|\/(?!\/)|#|www\.)/.test(href)
				? href.startsWith('www.')
					? `https://${href}`
					: href
				: undefined;
			pushTickerSegment(
				segments,
				match[1] ?? match[3] ?? '',
				safeHref ? 'link' : 'text',
				safeHref,
			);
			lastIndex = index + match[0].length;
		}

		pushTickerSegment(segments, cleanValue.slice(lastIndex), 'text');

		return segments;
	}

	function pushTickerSegment(
		segments: CipSlenderTickerSegment[],
		value: string,
		kind: CipSlenderTickerSegment['kind'],
		href?: string,
	): void {
		const text = normalizeTickerText(value, kind === 'link');

		if (!text) {
			return;
		}

		const last = segments[segments.length - 1];

		if (last?.kind === kind && last.href === href) {
			last.text += text;
			return;
		}

		segments.push({ text, kind, href });
	}

	function normalizeTickerText(value: string, trim = false): string {
		const text = value.replace(/[>#*_`~]/g, '').replace(/\s+/g, ' ');

		return trim ? text.trim() : text;
	}

	function makeCipPreviewHref(
		currentUrl: URL,
		path: string,
		hash = '',
	): string {
		const nextUrl = makeCipPreviewUrl(currentUrl, path);
		nextUrl.hash = hash;

		return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
	}

	function makeCipPreviewUrl(currentUrl: URL, path: string): URL {
		const nextUrl = new URL(
			themePreviewHref(currentUrl, path),
			currentUrl.origin,
		);
		nextUrl.searchParams.set('themePreview', 'cip-slender');

		return nextUrl;
	}

	beforeNavigate(({ to, cancel, type }) => {
		drawerClose();
		if (
			type !== 'link' ||
			!to ||
			to.url.origin !== $page.url.origin ||
			!$page.url.searchParams.has('themePreview') ||
			to.url.searchParams.has('themePreview')
		)
			return;
		cancel();
		void goto(themePreviewHref($page.url, to.url.href));
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

	$: isCipSlenderThemePreview =
		$page.url.searchParams.get('themePreview') === 'cip-slender';
	$: effectiveTopbarStats = cipReference
		? {
				twitchChannels: cipReference.topbarStats[0]?.[0] ?? 0,
				twitchViewers: cipReference.topbarStats[0]?.[1] ?? 0,
				youtubeChannels: cipReference.topbarStats[1]?.[0] ?? 0,
				youtubeViewers: cipReference.topbarStats[1]?.[1] ?? 0,
			}
		: isCipSlenderThemePreview
			? {
					twitchChannels: 0,
					twitchViewers: 0,
					youtubeChannels: 0,
					youtubeViewers: 0,
				}
			: topbarStats;
	$: effectiveOnlinePlayerCount = cipReference
		? Number(cipReference.onlineCount.replace(/[^0-9]/g, ''))
		: isCipSlenderThemePreview
			? 0
			: onlinePlayerCount;

	const formatTopbarCount = (value: number): string =>
		String(normalizeTopbarCount(value));

	$: formattedOnlinePlayerCount = new Intl.NumberFormat('en-US').format(
		effectiveOnlinePlayerCount,
	);
	$: formattedTwitchChannels = formatTopbarCount(
		effectiveTopbarStats.twitchChannels,
	);
	$: formattedTwitchViewers = formatTopbarCount(
		effectiveTopbarStats.twitchViewers,
	);
	$: formattedYoutubeChannels = formatTopbarCount(
		effectiveTopbarStats.youtubeChannels,
	);
	$: formattedYoutubeViewers = formatTopbarCount(
		effectiveTopbarStats.youtubeViewers,
	);

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

<div
	class={`theme-cip-slender${
		layout === 'compact-wide' ? ' theme-cip-slender--wide' : ''
	}${isCompactNewsToolPage ? ' theme-cip-slender--compact-news' : ''}`}
	style={shellStyle}>
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
			<a
				href={homeHref}
				class="theme-cip-slender__logo"
				aria-label={PUBLIC_TITLE}>
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
							href={accountHref}>
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
								loginButton ? 'theme-cip-slender__image-button--rendered' : ''
							}`}
							href={accountLoginHref}>
							{#if loginButton}
								<img src={loginButton} alt={$_('login')} />
							{:else}
								<span>{$_('login')}</span>
							{/if}
						</a>
						<a
							class="theme-cip-slender__create-account-link theme-cip-slender__create-account-link--loginbox"
							href={accountSignupHref}>
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
							downloadButton ? 'theme-cip-slender__image-button--rendered' : ''
						}`}
						href={themePreviewHref($page.url, PUBLIC_DOWNLOAD_URL)}>
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
			<header
				class="theme-cip-slender__topbar theme-cip-slender__center-chrome">
				<button
					class="theme-cip-slender__mobile-menu"
					type="button"
					on:click={drawerOpen}
					aria-label="Open menu">
					<Fa icon={faBars} />
				</button>
				<InfoBar
					channels={[
						{
							href: presentationHref(
								'twitch',
								'https://www.twitch.tv/directory/game/Tibia',
							),
							label: 'Twitch',
							icon: topIconTwitch,
							channels: formattedTwitchChannels,
							viewers: formattedTwitchViewers,
						},
						...(PUBLIC_WIKI_URL || presentation
							? [
									{
										href: presentationHref(
											'youtube',
											'https://www.youtube.com/channel/UCg5vFOB3tN8KGcJDyk6QQzQ/home',
										),
										label: 'YouTube',
										icon: topIconYoutube,
										channels: formattedYoutubeChannels,
										viewers: formattedYoutubeViewers,
									},
								]
							: []),
					]}
					signal={topIconSignal}
					eye={topIconEye}
					downloadIcon={topIconDownload}
					downloadHref={presentationHref(
						'fankit',
						'https://www.tibia.com/forum/?action=announcement&announcementid=87&boardid=89516',
					)}
					onlineIcon={topIconOnline}
					{onlineHref}
					onlineCount={formattedOnlinePlayerCount} />
			</header>

			{#if showNewsTicker}
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
						{#each tickerItems as item, index}
							<input
								class="theme-cip-slender__ticker-toggle"
								type="checkbox"
								bind:checked={expandedTickers[index]}
								id={`theme-cip-slender-ticker-${index}`} />
							<label
								class={`theme-cip-slender__ticker-row ${
									index % 2 === 0
										? 'theme-cip-slender__ticker-row--odd'
										: 'theme-cip-slender__ticker-row--even'
								}`}
								for={`theme-cip-slender-ticker-${index}`}
								data-news-href={item.href}>
								{#if item.icon.startsWith('/theme-assets/cip-slender/')}
									<img src={item.icon} alt="" aria-hidden="true" />
								{:else if item.icon === 'development' && newsTickerIconDevelopment}
									<img
										src={newsTickerIconDevelopment}
										alt=""
										aria-hidden="true" />
								{:else if newsTickerIconCommunity}
									<img
										src={newsTickerIconCommunity}
										alt=""
										aria-hidden="true" />
								{/if}
								<span class="theme-cip-slender__ticker-date">{item.date}</span>
								<!-- prettier-ignore -->
								<span class="theme-cip-slender__ticker-copy">{#each item.copySegments as segment}{#if segment.href}<a class="theme-cip-slender__ticker-link" href={themePreviewHref($page.url, segment.href)}>{segment.text}</a>{:else}{segment.text}{/if}{/each}</span>
								<span
									class="theme-cip-slender__ticker-control"
									aria-hidden="true"></span>
							</label>
						{/each}
					</div>
				</section>
			{/if}

			<ContentFrame
				{title}
				ornament={contentOrnament}
				titleBackground={contentTitleBackground}
				frameHorizontal={contentFrameHorizontal}
				frameVertical={contentFrameVertical}
				frameEdge={contentFrameEdge}
				cornerTopLeft={contentCornerTopLeftClean ?? contentCornerTopLeft}
				cornerTopRight={contentCornerTopRightClean ?? contentCornerTopRight}
				cornerBottomLeft={contentCornerBottomLeftClean ??
					contentCornerBottomLeft}
				cornerBottomRight={contentCornerBottomRightClean ??
					contentCornerBottomRight}
				border={contentBorder}
				headlineImage={title === 'Latest News'
					? headlineNews
					: title === 'News Archive'
						? headlineNewsArchive
						: title === 'Event Schedule'
							? headlineEventSchedule
							: (information?.headline.src ?? null)}
				headlineWidth={information?.headline.width ??
					(isEventSchedulePage ? 192 : 250)}
				headlineHeight={information?.headline.height ??
					(isEventSchedulePage ? 32 : 28)}
				compact={isCompactNewsToolPage}
				paperMinHeight={isInformationPage
					? 0
					: layout === 'compact-wide'
						? 640
						: layout === 'compact'
							? 241
							: 620}
				{paperTexture}>
				<slot />
			</ContentFrame>

			<footer class="theme-cip-slender__footer">
				<div>
					{presentation?.footer ??
						'Copyright by SlenderAAC. All rights reserved.'}
				</div>
				<div>
					<a href={presentationHref('about', '/pages/about')}
						>{presentation ? 'About CipSoft' : 'About SlenderAAC'}</a>
					|
					<a href={presentationHref('agreement', '/pages/rules')}
						>Service Agreement</a>
					|
					<a href={presentationHref('privacy', '/pages/privacy')}
						>Privacy Policy</a>
				</div>
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
				<a
					class="theme-cip-slender__right-boost theme-cip-slender__right-boost--creature"
					href={presentationHref(
						'creature',
						'https://www.tibia.com/library/?subtopic=creatures',
					)}
					aria-label="Today's boosted creature">
					{#if rightCreature}
						<img src={rightCreature} alt="" aria-hidden="true" />
					{/if}
				</a>
				<a
					class="theme-cip-slender__right-boost theme-cip-slender__right-boost--boss"
					href={presentationHref(
						'boss',
						'https://www.tibia.com/library/?subtopic=boostablebosses',
					)}
					aria-label="Today's boosted boss">
					{#if rightBoss}
						<img src={rightBoss} alt="" aria-hidden="true" />
					{/if}
				</a>
			</div>

			{#if promoPremiumBox}
				<a
					class="theme-cip-slender__official-box theme-cip-slender__official-box--premium"
					style={premiumButtonStyle}
					aria-label={`${premiumOfferText} ${premiumButtonText}`}
					href={shopHref}>
					<img src={promoPremiumBox} alt="Webshop" />
					{#if premiumCrown}
						<img
							class="theme-cip-slender__premium-crown"
							src={premiumCrown}
							alt=""
							aria-hidden="true" />
					{/if}
					{#if premiumPromoArt}
						<span class="theme-cip-slender__premium-art">
							<img src={premiumPromoArt} alt="" aria-hidden="true" />
						</span>
					{/if}
					{#if premiumOverlay}
						<img
							class="theme-cip-slender__premium-overlay"
							src={premiumOverlay}
							alt=""
							aria-hidden="true" />
					{/if}
					<strong class="theme-cip-slender__premium-offer">
						{premiumOfferText}
					</strong>
					<span class="theme-cip-slender__premium-button">
						{#if premiumButtonLabel}
							<img
								class="theme-cip-slender__premium-button-label"
								src={premiumButtonLabel}
								alt=""
								aria-hidden="true" />
						{/if}
						<span class:sr-only={!!premiumButtonLabel}
							>{premiumButtonText}</span>
						{#if premiumButtonDecor}<img
								class="theme-cip-slender__premium-button-decor"
								src={premiumButtonDecor}
								alt=""
								aria-hidden="true" />{/if}
					</span>
				</a>
			{/if}

			{#if promoNetworksBox}
				<div
					class="theme-cip-slender__official-box theme-cip-slender__official-box--network">
					<img src={promoNetworksBox} alt="Networks" />
					<div class="theme-cip-slender__network-links">
						<a
							href={presentationHref(
								'facebook',
								'https://www.facebook.com/tibia',
							)}
							target="_blank"
							rel="noreferrer">
							{#if networkFacebook}
								<img src={networkFacebook} alt="Facebook" />
							{:else}
								<Fa icon={faDiscord} />
							{/if}
						</a>
						{#if PUBLIC_WIKI_URL || presentation}
							<a
								href={presentationHref(
									'networkYoutube',
									'https://www.youtube.com/@cipsoft',
								)}
								target="_blank"
								rel="noreferrer">
								{#if networkYoutube}
									<img src={networkYoutube} alt="YouTube" />
								{:else}
									<Fa icon={faBookBookmark} />
								{/if}
							</a>
						{/if}
					</div>
				</div>
			{/if}

			{#if showAuxiliaryThemeboxes && promoTrailerBox}
				<a
					class="theme-cip-slender__official-box theme-cip-slender__official-box--trailer"
					href={presentationHref(
						'trailer',
						'https://www.youtube.com/watch?v=OpAaLT_PTCU',
					)}
					aria-label="Play Tibia trailer">
					<img src={promoTrailerBox} alt="Trailer" />
					{#if trailerPreview}
						<img
							class="theme-cip-slender__trailer-preview"
							src={trailerPreview}
							alt="" />
					{/if}
				</a>
			{/if}

			{#if showAuxiliaryThemeboxes && promoScreenshotBox}
				<a
					class="theme-cip-slender__official-box theme-cip-slender__official-box--screenshot"
					href={presentationHref(
						'screenshot',
						'https://www.tibia.com/abouttibia/?subtopic=screenshots',
					)}
					aria-label="Screenshot of the day">
					<img src={promoScreenshotBox} alt="Screenshots" />
					{#if promoScreenshotFrame && promoScreenshotImage}
						<div class="theme-cip-slender__screenshot-image-clip">
							<span
								class="theme-cip-slender__screenshot-image"
								style={`background-image: url("${promoScreenshotImage}")`}
							></span>
						</div>
						<img
							class="theme-cip-slender__screenshot-frame"
							src={promoScreenshotFrame}
							alt=""
							aria-hidden="true" />
					{/if}
				</a>
			{/if}

			{#if showAuxiliaryThemeboxes && promoPollBox}
				<div
					class="theme-cip-slender__official-box theme-cip-slender__official-box--poll"
					style={pollBoxStyle}>
					<img src={promoPollBox} alt="Current Poll" />
					<strong class="theme-cip-slender__poll-question">
						<span
							>{#if cipReference?.pollText ?? presentation?.pollText}{cipReference?.pollText ??
									presentation?.pollText}{:else}Guess the Date of<br />the
								Update!{/if}</span>
					</strong>
					<a
						class="theme-cip-slender__poll-button"
						href={presentationHref(
							'poll',
							'https://www.tibia.com/community/?subtopic=polls',
						)}>Vote Now</a>
					<span class="theme-cip-slender__poll-bottom" aria-hidden="true"
					></span>
				</div>
			{/if}
			{#if promoFansitesBox}
				<div
					class="theme-cip-slender__official-box theme-cip-slender__official-box--fansites"
					style={fansitesBoxStyle}>
					<img src={promoFansitesBox} alt="Fansites" />
					<a
						class="theme-cip-slender__fansite-logo-frame"
						href={presentationHref('fansite', fansitesHref)}
						target="_blank"
						rel="noreferrer"
						aria-label="Featured fansite">
						{#if fansiteLogo}
							<img src={fansiteLogo} alt="" aria-hidden="true" />
						{/if}
					</a>
					<a class="theme-cip-slender__fansite-button" href={fansitesHref}>
						View all Fansites
					</a>
				</div>
			{/if}
		</aside>
	</div>
</div>

<style>
	.theme-cip-slender {
		position: relative;
		box-sizing: border-box;
		min-height: 100vh;
		padding: 8px 0 0;
		display: flow-root;
		overflow-x: clip;
		background: rgb(5 17 34);
		color: rgb(42 27 17);
		font-family: Verdana, Arial, ui-sans-serif, system-ui, sans-serif;
	}

	.theme-cip-slender .theme-cip-slender__background {
		position: absolute;
		inset: 0;
		z-index: 0;
		background-color: rgb(5 17 34);
		background-position: top center;
		background-repeat: no-repeat;
		background-size: 1600px auto;
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
		grid-template-columns:
			180px minmax(
				var(--cip-center-minimum, 0px),
				var(--cip-center-width, 865px)
			)
			180px;
		align-items: start;
		column-gap: var(--cip-column-gap, 14px);
		row-gap: 12px;
		width: min(
			var(--cip-shell-width, 1263px),
			calc(100% - var(--cip-shell-gutter, 24px))
		);
		margin: 0 auto -3px;
		left: var(--cip-shell-left, 5px);
		top: -3px;
	}

	.theme-cip-slender:not(.theme-cip-slender--compact-news) {
		--cip-shell-width: 1253px;
		--cip-shell-left: 0.5px;
		--cip-shell-gutter: 27px;
	}

	.theme-cip-slender.theme-cip-slender--wide {
		--cip-center-width: 915px;
		--cip-column-gap: 7px;
		--cip-shell-width: 1299px;
		--cip-shell-left: 22.5px;
		--cip-left-offset: 1px;
		--cip-center-offset: 10px;
		--cip-right-offset: 18px;
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
		font-weight: 600;
		text-shadow: none;
	}

	.theme-cip-slender .theme-cip-slender__left,
	.theme-cip-slender .theme-cip-slender__right {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.theme-cip-slender .theme-cip-slender__right {
		transform: translateX(var(--cip-right-offset, 3px));
	}

	.theme-cip-slender .theme-cip-slender__left {
		gap: 4px;
		transform: translateX(var(--cip-left-offset, 0px));
	}

	.theme-cip-slender .theme-cip-slender__center {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 8px;
		transform: translateX(var(--cip-center-offset, 2px));
	}

	.theme-cip-slender .theme-cip-slender__footer {
		margin-top: 10px;
		margin-left: -5px;
		width: calc(100% + 10px);
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

	.theme-cip-slender .theme-cip-slender__create-account-link--loginbox {
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
				var(--cip-center-chrome-top-border-position, -1px 0) / 16px 6px repeat-x,
			var(--cip-content-border, none)
				var(--cip-center-chrome-bottom-border-position, -1px bottom) / 16px 6px
				repeat-x,
			var(--cip-center-chrome-fill, rgb(35 35 34));
		image-rendering: pixelated;
	}

	.theme-cip-slender .theme-cip-slender__center-chrome::before,
	.theme-cip-slender .theme-cip-slender__center-chrome::after {
		position: absolute;
		left: -4px;
		width: calc(100% + 8px);
		height: 17px;
		background-repeat: no-repeat;
		background-size:
			17px 17px,
			17px 17px;
		content: '';
		image-rendering: pixelated;
		pointer-events: none;
		z-index: 3;
	}

	.theme-cip-slender .theme-cip-slender__center-chrome::before {
		top: -4px;
		background-image:
			var(--cip-info-corner-tl, none), var(--cip-info-corner-tr, none);
		background-position:
			left top,
			right top;
	}

	.theme-cip-slender .theme-cip-slender__center-chrome::after {
		bottom: -4px;
		background-image:
			var(--cip-info-corner-bl, none), var(--cip-info-corner-br, none);
		background-position:
			left top,
			right top;
	}

	.theme-cip-slender .theme-cip-slender__topbar {
		position: relative;
		box-sizing: border-box;
		display: flex;
		width: 100%;
		height: 40px;
		min-height: 40px;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0;
		margin-left: 0;
		padding: 12px 6px 0 7px;
		--cip-info-frame-edge: var(--cip-content-frame-edge, none);
		--cip-info-frame-vertical: var(--cip-content-frame-vertical, none);
		--cip-center-chrome-top-border-position: 1px 0;
		--cip-center-chrome-bottom-border-position: 1px bottom;
		--cip-center-chrome-fill:
			var(--cip-cache-title, var(--cip-news-headline, none)) 1px 6px / 83px 28px
				repeat-x,
			rgb(93 14 10);
		box-shadow: none;
		color: rgb(242 226 195);
		font-family: Verdana, Arial, Helvetica, sans-serif;
		font-size: 10px;
		font-weight: 700;
		line-height: 1;
	}

	.theme-cip-slender
		.theme-cip-slender__topbar.theme-cip-slender__center-chrome::before {
		background-position:
			left top,
			calc(100% - 2px) top;
	}

	.theme-cip-slender
		.theme-cip-slender__topbar.theme-cip-slender__center-chrome::after {
		background-position:
			-1px top,
			calc(100% - 1px) top;
	}

	.theme-cip-slender .theme-cip-slender__ticker {
		position: relative;
		--cip-center-chrome-fill: rgb(222 187 157);
		--cip-center-chrome-top-border-position: 1px -1px;
		--cip-center-chrome-bottom-border-position: 1px calc(100% - 1px);
		margin-top: 10px;
		margin-bottom: 10px;
		padding: 6px 6px 6px;
		background:
			var(--cip-info-frame-edge, none) left top 4px / 5px 5px no-repeat,
			var(--cip-info-frame-edge, none) right top 4px / 5px 5px no-repeat,
			var(--cip-info-frame-edge, none) left bottom 4px / 5px 5px no-repeat,
			var(--cip-info-frame-edge, none) right bottom 4px / 5px 5px no-repeat,
			linear-gradient(rgb(58 55 56), rgb(58 55 56)) left -1px top 5px / 2px
				calc(100% - 10px) no-repeat,
			linear-gradient(rgb(58 55 56), rgb(58 55 56)) right -1px top 5px / 2px
				calc(100% - 10px) no-repeat,
			var(--cip-content-border, none)
				var(--cip-center-chrome-top-border-position, -1px 0) / 16px 6px repeat-x,
			var(--cip-content-border, none)
				var(--cip-center-chrome-bottom-border-position, -1px bottom) / 16px 6px
				repeat-x,
			var(--cip-center-chrome-fill, rgb(35 35 34));
		box-shadow: none;
	}

	.theme-cip-slender
		.theme-cip-slender__ticker.theme-cip-slender__center-chrome::before {
		top: -5px;
		width: calc(100% + 3px);
		background-image:
			var(--cip-ticker-corner-tl, var(--cip-info-corner-tl, none)),
			var(--cip-ticker-corner-tr, var(--cip-info-corner-tr, none));
	}

	.theme-cip-slender
		.theme-cip-slender__ticker.theme-cip-slender__center-chrome::after {
		bottom: -3px;
		width: calc(100% + 4px);
		background-image:
			var(--cip-ticker-corner-bl, var(--cip-info-corner-bl, none)),
			var(--cip-ticker-corner-br, var(--cip-info-corner-br, none));
		background-position:
			-1px top,
			right top;
	}

	.theme-cip-slender .theme-cip-slender__ticker header {
		display: flex;
		align-items: flex-start;
		gap: 0;
		height: 24px;
		min-height: 24px;
		margin: 0 -4px;
		padding: 0 14px 0 5px;
		border: 0;
		background:
			var(--cip-content-title, none) repeat-x,
			linear-gradient(180deg, rgb(31 74 23), rgb(20 48 16));
		background-position:
			0 1px,
			0 0;
		color: rgb(240 224 178);
	}

	.theme-cip-slender .theme-cip-slender__ticker header img {
		width: 16px;
		height: 16px;
		image-rendering: pixelated;
	}

	.theme-cip-slender
		.theme-cip-slender__ticker
		header
		.theme-cip-slender__headline-image {
		width: 250px;
		height: 28px;
		image-rendering: pixelated;
		object-fit: none;
		object-position: left top;
		transform: translateY(0);
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
		position: relative;
		box-sizing: border-box;
		min-height: 120px;
		margin: 0 -4px;
		padding: 10px 10px 6px;
	}
	.theme-cip-slender .theme-cip-slender__ticker-body::before {
		position: absolute;
		inset: 4px;
		border: 1px solid rgb(121 61 3);
		background: rgb(255 242 219);
		content: '';
		pointer-events: none;
	}

	.theme-cip-slender .theme-cip-slender__ticker-toggle {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: 0;
		opacity: 0;
		pointer-events: none;
	}

	.theme-cip-slender .theme-cip-slender__ticker-row {
		position: relative;
		display: block;
		overflow: hidden;
		height: 20px;
		padding: 2px 22px 2px 2px;
		border: 0;
		color: rgb(90 40 0);
		cursor: text;
		font-family: Verdana, Arial, 'Times New Roman', sans-serif;
		font-size: 12px;
		line-height: normal;
		text-decoration: none;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.theme-cip-slender .theme-cip-slender__ticker-row--odd {
		background: rgb(212 192 161);
	}

	.theme-cip-slender .theme-cip-slender__ticker-row--even {
		background: rgb(241 224 198);
	}

	.theme-cip-slender
		.theme-cip-slender__ticker-toggle:checked
		+ .theme-cip-slender__ticker-row {
		height: auto;
		min-height: 34px;
		padding-left: 112px;
		white-space: normal;
	}

	.theme-cip-slender .theme-cip-slender__ticker-control {
		position: absolute;
		top: 3px;
		right: 3px;
		z-index: 2;
		width: 12px;
		height: 12px;
		background: var(--cip-ticker-expand, none) center / 12px 12px no-repeat;
		cursor: pointer;
		content: '';
		image-rendering: pixelated;
	}

	.theme-cip-slender
		.theme-cip-slender__ticker-toggle:checked
		+ .theme-cip-slender__ticker-row
		.theme-cip-slender__ticker-control {
		background-image: var(
			--cip-ticker-collapse,
			var(--cip-ticker-expand, none)
		);
	}

	.theme-cip-slender .theme-cip-slender__ticker-row > img {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		flex: 0 0 16px;
		image-rendering: pixelated;
	}

	.theme-cip-slender .theme-cip-slender__ticker-body span {
		margin-right: 0;
		color: rgb(90 40 0);
	}

	.theme-cip-slender .theme-cip-slender__ticker-date {
		position: absolute;
		top: 2px;
		left: 22px;
		display: block;
		margin-left: 0;
		overflow: visible;
		white-space: nowrap;
	}

	.theme-cip-slender .theme-cip-slender__ticker-copy {
		position: absolute;
		top: 2px;
		right: 22px;
		left: 112px;
		display: block;
		height: 16px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.theme-cip-slender
		.theme-cip-slender__ticker-toggle:checked
		+ .theme-cip-slender__ticker-row
		.theme-cip-slender__ticker-copy {
		position: static;
		height: auto;
		min-height: 30px;
		white-space: normal;
	}

	.theme-cip-slender
		.theme-cip-slender__ticker-toggle:focus-visible
		+ .theme-cip-slender__ticker-row {
		outline: 1px solid rgb(0 66 148);
		outline-offset: -1px;
	}

	.theme-cip-slender .theme-cip-slender__ticker-link {
		color: rgb(0 66 148);
		font-weight: 700;
	}

	.theme-cip-slender .theme-cip-slender__footer a {
		color: rgb(255 255 255);
		text-decoration: none;
	}

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
		box-sizing: border-box;
		min-height: 42px;
		padding: 0 0 20px;
		color: rgb(255 255 255);
		font-family: Verdana, Arial, sans-serif;
		font-size: 9.33333px;
		font-weight: 400;
		line-height: 11px;
		text-align: center;
		text-shadow: 1px 1px 2px rgb(0 0 0);
	}

	.theme-cip-slender .theme-cip-slender__footer div + div {
		margin-top: 0;
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
		display: none;
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
		transform: translate(1px, 15px);
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
		left: 23px;
	}

	.theme-cip-slender .theme-cip-slender__right-boost--boss {
		left: 80px;
	}

	.theme-cip-slender .theme-cip-slender__right-boost > img {
		position: absolute;
		top: -24px;
		left: -9px;
		z-index: 1;
		width: 64px;
		max-width: none;
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

	.theme-cip-slender .theme-cip-slender__network-links :global(svg) {
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
		height: 98px;
	}

	.theme-cip-slender .theme-cip-slender__official-box--fansites {
		height: 188px;
		background: transparent;
	}

	.theme-cip-slender
		.theme-cip-slender__official-box--fansites
		> img:first-child {
		height: 43px;
	}

	.theme-cip-slender .theme-cip-slender__official-box--trailer {
		height: 153px;
		background: transparent;
	}

	.theme-cip-slender .theme-cip-slender__official-box--screenshot {
		height: 154px;
		background: transparent;
	}

	.theme-cip-slender .theme-cip-slender__official-box--network::after,
	.theme-cip-slender .theme-cip-slender__official-box--trailer::after,
	.theme-cip-slender .theme-cip-slender__official-box--screenshot::after {
		position: absolute;
		bottom: 0;
		left: -1px;
		z-index: 3;
		display: block;
		width: 180px;
		height: 12px;
		background: var(--cip-right-themebox-bottom, transparent) center / 180px
			12px no-repeat;
		content: '';
		pointer-events: none;
	}

	.theme-cip-slender .theme-cip-slender__official-box--poll {
		height: 154px;
	}

	.theme-cip-slender .theme-cip-slender__fansite-logo-frame {
		position: absolute;
		top: 31px;
		left: 0;
		display: block;
		width: 180px;
		height: 145px;
		background: var(--cip-fansites-logo-frame, transparent) center / 180px 145px
			no-repeat;
	}

	.theme-cip-slender .theme-cip-slender__fansite-logo-frame img {
		position: absolute;
		top: 8px;
		left: 15px;
		display: block;
		width: 150px;
		height: 100px;
		max-width: none;
		object-fit: cover;
	}

	.theme-cip-slender .theme-cip-slender__fansite-button {
		position: absolute;
		top: 144px;
		left: 22px;
		z-index: 2;
		display: block;
		width: 135px;
		height: 25px;
		color: rgb(255 209 140);
		font-family: Verdana, Arial, sans-serif;
		font-size: 12px;
		font-weight: 700;
		line-height: 25px;
		text-align: center;
		text-decoration: none;
		text-shadow: 1px 1px 0 rgb(0 0 0);
		background: var(--cip-fansites-button, rgb(17 37 154)) center / 135px 25px
			no-repeat;
	}

	.theme-cip-slender .theme-cip-slender__poll-question {
		position: absolute;
		top: 37px;
		left: 15px;
		z-index: 2;
		display: block;
		width: 150px;
		height: 75px;
		color: rgb(90 40 0);
		font-family: Verdana, Arial, sans-serif;
		font-size: 13.3333px;
		font-weight: 700;
		line-height: 14.6667px;
		text-align: center;
	}

	.theme-cip-slender .theme-cip-slender__poll-button {
		position: absolute;
		top: 109px;
		left: 22px;
		z-index: 2;
		display: block;
		width: 135px;
		height: 25px;
		color: rgb(255 209 140);
		font-family: Verdana, Arial, 'Times New Roman', sans-serif;
		font-size: 12px;
		font-weight: 700;
		line-height: 25px;
		text-align: center;
		text-shadow: 1px 1px 0 rgb(0 0 0);
		background: var(--cip-poll-button, rgb(17 37 154)) center / 135px 25px
			no-repeat;
	}

	.theme-cip-slender .theme-cip-slender__poll-button:hover {
		background-image: var(--cip-poll-button-hover, var(--cip-poll-button));
	}

	.theme-cip-slender .theme-cip-slender__poll-bottom {
		position: absolute;
		top: 142px;
		left: 0;
		z-index: 3;
		display: block;
		width: 180px;
		height: 12px;
		background: var(--cip-poll-bottom, transparent) center / 180px 12px
			no-repeat;
		pointer-events: none;
	}

	.theme-cip-slender .theme-cip-slender__premium-art {
		position: absolute;
		top: 34px;
		left: 10px;
		display: flex;
		width: 160px;
		height: 126px;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: transparent;
	}

	.theme-cip-slender .theme-cip-slender__premium-art img {
		display: block;
		width: 160px;
		height: 126px;
		object-fit: cover;
	}

	.theme-cip-slender .theme-cip-slender__premium-crown,
	.theme-cip-slender .theme-cip-slender__premium-overlay,
	.theme-cip-slender .theme-cip-slender__premium-button-label {
		position: absolute;
		display: block;
		max-width: none;
		pointer-events: none;
	}

	.theme-cip-slender .theme-cip-slender__premium-crown {
		top: -28px;
		left: 5px;
		z-index: 2;
		width: 64px;
		height: 64px;
	}

	.theme-cip-slender .theme-cip-slender__premium-overlay {
		top: 34px;
		left: 10px;
		z-index: 3;
		width: 163px;
		height: 26px;
	}

	.theme-cip-slender .theme-cip-slender__premium-offer {
		position: absolute;
		top: 37px;
		left: 10px;
		z-index: 4;
		display: block;
		width: 163px;
		height: 13px;
		overflow: hidden;
		color: white;
		font-family: Verdana, Arial, sans-serif;
		font-size: 11px;
		font-weight: 400;
		line-height: 13px;
		text-align: center;
		text-shadow:
			1px 1px 0 rgb(0 0 0),
			0 0 3px rgb(0 0 0 / 0.8);
	}

	.theme-cip-slender .theme-cip-slender__premium-button {
		position: absolute;
		top: 161px;
		left: 18px;
		display: flex;
		width: 142px;
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

	.theme-cip-slender .theme-cip-slender__premium-button-decor {
		position: absolute;
		display: block;
		max-width: none;
		pointer-events: none;
		top: -17px;
		left: 15px;
		z-index: 2;
		width: 114px;
		height: 26px;
	}

	.theme-cip-slender .theme-cip-slender__premium-button-label {
		top: 2px;
		left: 1px;
		width: 140px;
		height: 30px;
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
		top: 42px;
		right: auto;
		bottom: auto;
		left: 57px;
		display: flex;
		width: 63px;
		height: 53px;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 3px;
	}

	.theme-cip-slender .theme-cip-slender__network-links a {
		display: block;
		width: 30px;
		height: 53px;
		min-height: 0;
		border: 0;
		background: transparent;
		box-shadow: none;
		padding: 0;
	}

	.theme-cip-slender .theme-cip-slender__network-links img {
		display: block;
		width: 30px !important;
		max-width: none;
		height: 30px !important;
		object-fit: contain;
	}

	.theme-cip-slender .theme-cip-slender__trailer-preview {
		position: absolute;
		top: 31px;
		left: 5px;
		width: 170px !important;
		height: 110px !important;
	}

	.theme-cip-slender .theme-cip-slender__screenshot-image-clip {
		position: absolute;
		top: 35px;
		left: 5px;
		width: 170px;
		height: 102px;
		overflow: hidden;
	}

	.theme-cip-slender .theme-cip-slender__screenshot-image {
		position: absolute;
		top: -120px;
		left: -155px;
		display: block;
		width: 480px;
		height: 352px;
		background-position: left top;
		background-repeat: no-repeat;
		background-size: 480px 352px;
	}

	.theme-cip-slender .theme-cip-slender__screenshot-frame {
		position: absolute;
		top: 31px;
		left: 5px;
		z-index: 2;
		display: block;
		width: 170px;
		max-width: none;
		height: 111px;
		pointer-events: none;
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
		display: none;
	}

	@media (max-width: 1280px) {
		.theme-cip-slender .theme-cip-slender__background {
			background-position: -170px top;
		}
	}

	@media (min-width: 981px) and (max-width: 1280px) {
		.theme-cip-slender.theme-cip-slender--compact-news
			.theme-cip-slender__shell {
			grid-template-columns:
				180px minmax(var(--cip-center-minimum, 0px), 865px)
				180px;
			width: calc(100% - 27px);
			margin-left: 14px;
			margin-right: 0;
			left: 0;
		}
		.theme-cip-slender.theme-cip-slender--wide .theme-cip-slender__shell {
			grid-template-columns: 180px 915px 180px;
			width: 1299px;
			margin-left: 13px;
		}
	}

	@media (max-width: 980px) {
		.theme-cip-slender {
			padding: 12px 8px;
		}

		.theme-cip-slender .theme-cip-slender__shell {
			grid-template-columns: minmax(0, 1fr);
			width: 100%;
			left: 0;
		}

		.theme-cip-slender .theme-cip-slender__center {
			transform: none;
		}

		.theme-cip-slender .theme-cip-slender__left,
		.theme-cip-slender .theme-cip-slender__right {
			display: none;
		}

		.theme-cip-slender .theme-cip-slender__topbar {
			flex-wrap: wrap;
			height: auto;
			min-height: 40px;
			padding: 8px;
			gap: 6px;
		}

		.theme-cip-slender .theme-cip-slender__mobile-menu {
			display: inline-flex;
		}

		.theme-cip-slender .theme-cip-slender__links {
			display: none;
		}
	}
</style>
