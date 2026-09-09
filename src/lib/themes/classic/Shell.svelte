<script lang="ts">
	import './native.css';

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

	import { PUBLIC_DOWNLOAD_URL, PUBLIC_TITLE } from '$env/static/public';

	import type { LayoutData } from '../../../routes/(app)/$types';
	import type { ClassicNewsReference } from './reference-types';
	import ContentFrame from './ContentFrame.svelte';
	import { headlineFontStyle } from './headline';
	import InfoBar from './InfoBar.svelte';
	import { classicLayoutForPath } from './layout';
	import MediaDialog from './MediaDialog.svelte';
	import Menu from './Menu.svelte';
	import { classicNativePage } from './native-pages';
	import { classicAsset } from './theme';

	type ClassicLayoutData = LayoutData & {
		selectedTheme?: string;
		themeAssets?: Record<string, string | undefined>;
		themeAssetWarning?: string | null;
	};

	type ClassicTopbarStats = {
		twitchChannels?: number | null;
		twitchViewers?: number | null;
		youtubeChannels?: number | null;
		youtubeViewers?: number | null;
	};

	type ClassicNewsArticle = {
		id: number | string;
		title: string;
		created_at: Date | string;
		content?: string | null;
		category?: string;
	};

	type ClassicTickerSegment = {
		text: string;
		kind: 'text' | 'link';
		href?: string;
	};

	type ClassicTickerItem = {
		id: string;
		href: string;
		date: string;
		title: string;
		copySegments: ClassicTickerSegment[];
		icon: string;
	};

	const classicTickerMonths = [
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

	export let data: ClassicLayoutData;
	let tickerUrl = '';
	let expandedTickers: boolean[] = [];
	$: ({ isLoggedIn, isAdmin } = data);
	$: classicReference = (
		$page.data as { classicReference?: ClassicNewsReference | null }
	).classicReference;
	$: title = typeof $page.data.title === 'string' ? $page.data.title : '';
	$: information = (
		$page.data as { informationPresentation?: InformationPresentation | null }
	).informationPresentation;
	$: isInformationPage = !!$page.data.informationPage;
	$: currentPath = $page.url.pathname.replace(/\/$/, '') || '/';
	$: layout = classicLayoutForPath(currentPath);
	$: nativePage = classicNativePage(currentPath);
	$: isNewsArchivePage = currentPath === '/news/archive';
	$: isEventSchedulePage = layout === 'compact-wide';
	$: isCompactNewsToolPage = layout !== 'news';
	$: showNewsTicker = !isCompactNewsToolPage && tickerItems.length > 0;
	$: showAuxiliaryThemeboxes =
		!isCompactNewsToolPage || !!nativePage?.auxiliaryThemeboxes;
	$: showClassicGrid = $page.url.searchParams.get('classicGrid') === '1';
	$: themeSwitchHref = (() => {
		const nextUrl = new URL($page.url.href);
		nextUrl.searchParams.set('themePreview', 'legbone');
		nextUrl.searchParams.delete('classicGrid');

		return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
	})();
	$: fontStyle = headlineFontStyle(data.themeAssets?.headlineFont);
	$: homeHref = makeClassicPreviewHref($page.url, '/');
	$: accountHref = makeClassicPreviewHref($page.url, '/account');
	$: accountLoginHref = makeClassicPreviewHref($page.url, '/account/login');
	$: accountSignupHref = makeClassicPreviewHref($page.url, '/account/signup');
	$: onlineHref = makeClassicPreviewHref($page.url, '/online');
	$: shopHref = makeClassicPreviewHref($page.url, '/shop');
	$: presentation = data.classicPresentation;
	$: fansitesHref = presentationHref(
		'fansites',
		'https://www.tibia.com/community/?subtopic=fansites',
	);

	function presentationHref(key: string, fallback: string): string {
		return themePreviewHref($page.url, presentation?.links[key] ?? fallback);
	}
	$: tickerPageArticles = getTickerArticles($page.data.tickers);
	$: tickerItems = (
		classicReference
			? classicReference.ticker.map((item, index) => ({
					id: String(index),
					href: homeHref,
					date: item.date,
					title: '',
					copySegments: makeTickerTextSegments(item.text),
					icon: item.icon,
				}))
			: tickerPageArticles.map((article) => ({
					id: String(article.id),
					href: makeClassicPreviewHref($page.url, `/?ticker=${article.id}`),
					date: `${formatClassicTickerDate(article.created_at)} -`,
					title: '',
					copySegments: makeTickerSummarySegments(article),
					icon: tickerCategoryIcon(article.category),
				}))
	) satisfies ClassicTickerItem[];
	$: if (tickerUrl !== $page.url.href) {
		tickerUrl = $page.url.href;
		expandedTickers = tickerItems.map(
			(item) => $page.url.searchParams.get('ticker') === item.id,
		);
	}
	function tickerCategoryIcon(category?: string): string {
		const keys = {
			server: 'newsArchiveIconServer',
			community: 'newsArchiveIconCommunity',
			development: 'newsArchiveIconDevelopment',
			support: 'newsArchiveIconSupport',
			technical: 'newsArchiveIconTechnical',
		} as const;
		return (
			classicAsset(
				data.themeAssets,
				keys[category as keyof typeof keys] ?? keys.community,
			) ?? ''
		);
	}
	$: staticPages = data.staticPages;
	$: logo = classicAsset(data.themeAssets, 'logo');
	$: background = classicAsset(data.themeAssets, 'background');
	$: menuOrnament = classicAsset(data.themeAssets, 'menuOrnament');
	$: contentOrnament = classicAsset(data.themeAssets, 'contentOrnament');
	$: topIconTwitch = classicAsset(data.themeAssets, 'topIconTwitch');
	$: topIconYoutube = classicAsset(data.themeAssets, 'topIconYoutube');
	$: topIconDownload = classicAsset(data.themeAssets, 'topIconDownload');
	$: topIconOnline = classicAsset(data.themeAssets, 'topIconOnline');
	$: topIconSignal = classicAsset(data.themeAssets, 'topIconSignal');
	$: topIconEye = classicAsset(data.themeAssets, 'topIconEye');
	$: contentTitleBackground = classicAsset(
		data.themeAssets,
		'contentTitleBackground',
	);
	$: contentCacheTitleBackground = classicAsset(
		data.themeAssets,
		'contentCacheTitleBackground',
	);
	$: contentFrameHorizontal = classicAsset(
		data.themeAssets,
		'contentFrameHorizontal',
	);
	$: contentFrameVertical = classicAsset(
		data.themeAssets,
		'contentFrameVertical',
	);
	$: contentFrameEdge = classicAsset(data.themeAssets, 'contentFrameEdge');
	$: contentCornerTopLeft = classicAsset(
		data.themeAssets,
		'contentCornerTopLeft',
	);
	$: contentCornerTopRight = classicAsset(
		data.themeAssets,
		'contentCornerTopRight',
	);
	$: contentCornerBottomLeft = classicAsset(
		data.themeAssets,
		'contentCornerBottomLeft',
	);
	$: contentCornerBottomRight = classicAsset(
		data.themeAssets,
		'contentCornerBottomRight',
	);
	$: contentCornerTopLeftClean = classicAsset(
		data.themeAssets,
		'contentCornerTopLeftClean',
	);
	$: contentCornerTopRightClean = classicAsset(
		data.themeAssets,
		'contentCornerTopRightClean',
	);
	$: contentCornerBottomLeftClean = classicAsset(
		data.themeAssets,
		'contentCornerBottomLeftClean',
	);
	$: contentCornerBottomRightClean = classicAsset(
		data.themeAssets,
		'contentCornerBottomRightClean',
	);
	$: contentBorder = classicAsset(data.themeAssets, 'contentBorder');
	$: paperTexture = classicAsset(data.themeAssets, 'paperTexture');
	$: newsHeadlineBackground = classicAsset(
		data.themeAssets,
		'newsHeadlineBackground',
	);
	$: headlineNewsTicker = classicAsset(data.themeAssets, 'headlineNewsTicker');
	$: headlineNews = classicAsset(data.themeAssets, 'headlineNews');
	$: headlineNewsArchive = classicAsset(
		data.themeAssets,
		'headlineNewsArchive',
	);
	$: headlineEventSchedule = classicAsset(
		data.themeAssets,
		'headlineEventSchedule',
	);
	$: newsTickerIconCommunity = classicAsset(
		data.themeAssets,
		'newsTickerIconCommunity',
	);
	$: newsTickerIconDevelopment = classicAsset(
		data.themeAssets,
		'newsTickerIconDevelopment',
	);
	$: newsHeadlineIcon =
		classicReference?.assets.newsHeadlineIcon ??
		classicAsset(data.themeAssets, 'newsHeadlineIcon');
	$: tickerExpandIcon = classicAsset(data.themeAssets, 'menuExpandPlus');
	$: tickerCollapseIcon = classicAsset(data.themeAssets, 'menuExpandMinus');
	$: boxTop = classicAsset(data.themeAssets, 'boxTop');
	$: boxBottom = classicAsset(data.themeAssets, 'boxBottom');
	$: chain = classicAsset(data.themeAssets, 'chain');
	$: loginButton = classicAsset(data.themeAssets, 'loginButton');
	$: myAccountButton = classicAsset(data.themeAssets, 'myAccountButton');
	$: logoutButton = classicAsset(data.themeAssets, 'logoutButton');
	$: createAccountButton = classicAsset(
		data.themeAssets,
		'createAccountButton',
	);
	$: downloadButton = classicAsset(data.themeAssets, 'downloadButton');
	$: loginBoxBackground = classicAsset(data.themeAssets, 'loginBoxBackground');
	$: loginCreateAccountText = classicAsset(
		data.themeAssets,
		'loginCreateAccountText',
	);
	$: smallButtonBackground = classicAsset(
		data.themeAssets,
		'smallButtonBackground',
	);
	$: smallButtonHover = classicAsset(data.themeAssets, 'smallButtonHover');
	$: mediumButtonBackground = classicAsset(
		data.themeAssets,
		'mediumButtonBackground',
	);
	$: mediumButtonHover = classicAsset(data.themeAssets, 'mediumButtonHover');
	$: accountButtonStyle = [
		smallButtonBackground
			? `--classic-small-button: url("${smallButtonBackground}")`
			: '',
		smallButtonHover
			? `--classic-small-button-hover: url("${smallButtonHover}")`
			: '',
		mediumButtonBackground
			? `--classic-medium-button: url("${mediumButtonBackground}")`
			: '',
		mediumButtonHover
			? `--classic-medium-button-hover: url("${mediumButtonHover}")`
			: '',
		loginBoxBackground
			? `--classic-loginbox-background: url("${loginBoxBackground}")`
			: '',
		chain ? `--classic-chain: url("${chain}")` : '',
		boxTop ? `--classic-small-box-top: url("${boxTop}")` : '',
		boxBottom ? `--classic-small-box-bottom: url("${boxBottom}")` : '',
	]
		.filter(Boolean)
		.join('; ');
	$: contentChromeStyle = [
		contentTitleBackground
			? `--classic-content-title: url("${contentTitleBackground}")`
			: '',
		contentFrameHorizontal
			? `--classic-content-frame-horizontal: url("${contentFrameHorizontal}")`
			: '',
		contentFrameVertical
			? `--classic-content-frame-vertical: url("${contentFrameVertical}")`
			: '',
		contentFrameEdge
			? `--classic-content-frame-edge: url("${contentFrameEdge}")`
			: '',
		contentCornerTopLeftClean
			? `--classic-ticker-corner-tl: url("${contentCornerTopLeftClean}")`
			: '',
		contentCornerTopRightClean
			? `--classic-ticker-corner-tr: url("${contentCornerTopRightClean}")`
			: '',
		contentCornerBottomLeftClean
			? `--classic-ticker-corner-bl: url("${contentCornerBottomLeftClean}")`
			: '',
		contentCornerBottomRightClean
			? `--classic-ticker-corner-br: url("${contentCornerBottomRightClean}")`
			: '',
		tickerExpandIcon
			? `--classic-ticker-expand: url("${tickerExpandIcon}")`
			: '',
		tickerCollapseIcon
			? `--classic-ticker-collapse: url("${tickerCollapseIcon}")`
			: '',
		contentBorder ? `--classic-content-border: url("${contentBorder}")` : '',
	]
		.filter(Boolean)
		.join('; ');
	$: promoPremiumBox = classicAsset(data.themeAssets, 'promoPremiumBox');
	$: premiumPromoArt =
		classicReference?.assets.premiumPromoArt ??
		classicAsset(data.themeAssets, 'premiumPromoArt');
	$: premiumCrown =
		classicReference?.assets.premiumCrown ??
		classicAsset(data.themeAssets, 'premiumCrown');
	$: premiumOverlay = classicAsset(data.themeAssets, 'premiumOverlay');
	$: premiumButtonLabel = classicAsset(data.themeAssets, 'shopButton');
	$: premiumButtonDecor =
		classicAsset(data.themeAssets, 'premiumButtonDecor') ??
		classicAsset(data.themeAssets, 'premiumButtonPremiumTime');
	$: premiumOfferText =
		classicReference?.premiumText ??
		presentation?.premiumText ??
		(isNewsArchivePage ? 'Access ALL Areas!' : 'Get Supplies Anywhere!');
	$: premiumButtonText =
		classicReference?.premiumButtonText ??
		presentation?.premiumButtonText ??
		(isNewsArchivePage ? 'Get Premium' : 'Get Tibia Coins');
	$: premiumButtonBackground = classicAsset(
		data.themeAssets,
		'premiumButtonBackground',
	);
	$: premiumButtonHover = classicAsset(data.themeAssets, 'premiumButtonHover');
	$: promoFansitesBox = classicAsset(data.themeAssets, 'promoFansitesBox');
	$: fansiteLogoFrame = classicAsset(data.themeAssets, 'fansiteLogoFrame');
	$: fansiteLogo = classicAsset(data.themeAssets, 'fansiteLogo');
	$: fansiteButtonBackground = classicAsset(
		data.themeAssets,
		'fansiteButtonBackground',
	);
	$: premiumButtonStyle = [
		premiumButtonBackground
			? `--classic-premium-button: url("${premiumButtonBackground}")`
			: '',
		premiumButtonHover
			? `--classic-premium-button-hover: url("${premiumButtonHover}")`
			: '',
	]
		.filter(Boolean)
		.join('; ');
	$: fansitesBoxStyle = [
		fansiteLogoFrame
			? `--classic-fansites-logo-frame: url("${fansiteLogoFrame}")`
			: '',
		fansiteButtonBackground
			? `--classic-fansites-button: url("${fansiteButtonBackground}")`
			: '',
	]
		.filter(Boolean)
		.join('; ');
	$: pollBoxStyle = [
		smallButtonBackground
			? `--classic-poll-button: url("${smallButtonBackground}")`
			: '',
		smallButtonHover
			? `--classic-poll-button-hover: url("${smallButtonHover}")`
			: '',
		boxBottom ? `--classic-poll-bottom: url("${boxBottom}")` : '',
	]
		.filter(Boolean)
		.join('; ');
	$: shellStyle = [
		isInformationPage
			? `--classic-center-minimum: ${($page.data.informationPage?.minimumBodyWidth ?? 0) + 34}px`
			: '',
		newsHeadlineBackground
			? `--classic-news-headline: url("${newsHeadlineBackground}")`
			: '',
		contentCacheTitleBackground
			? `--classic-cache-title: url("${contentCacheTitleBackground}")`
			: '',
		contentBorder ? `--classic-content-border: url("${contentBorder}")` : '',
		contentFrameHorizontal
			? `--classic-info-frame-horizontal: url("${contentFrameHorizontal}")`
			: '',
		contentFrameVertical
			? `--classic-info-frame-vertical: url("${contentFrameVertical}")`
			: '',
		contentFrameEdge
			? `--classic-info-frame-edge: url("${contentFrameEdge}")`
			: '',
		contentCornerTopLeft
			? `--classic-info-corner-tl: url("${contentCornerTopLeft}")`
			: '',
		contentCornerTopRight
			? `--classic-info-corner-tr: url("${contentCornerTopRight}")`
			: '',
		contentCornerBottomLeft
			? `--classic-info-corner-bl: url("${contentCornerBottomLeft}")`
			: '',
		contentCornerBottomRight
			? `--classic-info-corner-br: url("${contentCornerBottomRight}")`
			: '',
		topIconSignal ? `--classic-top-icon-signal: url("${topIconSignal}")` : '',
		topIconEye ? `--classic-top-icon-eye: url("${topIconEye}")` : '',
		newsHeadlineIcon ? `--classic-news-icon: url("${newsHeadlineIcon}")` : '',
		boxBottom ? `--classic-right-themebox-bottom: url("${boxBottom}")` : '',
	]
		.filter(Boolean)
		.join('; ');
	$: promoNetworksBox = classicAsset(data.themeAssets, 'promoNetworksBox');
	$: networkFacebook = classicAsset(data.themeAssets, 'networkFacebook');
	$: networkYoutube = classicAsset(data.themeAssets, 'networkYoutube');
	$: promoTrailerBox = classicAsset(data.themeAssets, 'promoTrailerBox');
	$: trailerPreview = classicAsset(data.themeAssets, 'trailerPreview');
	$: trailerFrame = classicAsset(data.themeAssets, 'trailerFrame');
	$: trailerClose = classicAsset(data.themeAssets, 'trailerClose');
	$: promoScreenshotBox = classicAsset(data.themeAssets, 'promoScreenshotBox');
	$: promoScreenshotFrame = classicAsset(
		data.themeAssets,
		'promoScreenshotFrame',
	);
	$: promoScreenshotImage =
		classicReference?.assets.promoScreenshotImage ??
		classicAsset(data.themeAssets, 'promoScreenshotImage');
	$: promoPollBox = classicAsset(data.themeAssets, 'promoPollBox');
	$: rightTopper = classicAsset(data.themeAssets, 'rightTopper');
	$: rightCreature =
		classicReference?.assets.rightCreature ??
		classicAsset(data.themeAssets, 'rightCreature');
	$: rightBoss =
		classicReference?.assets.rightBoss ??
		classicAsset(data.themeAssets, 'rightBoss');

	function drawerOpen(): void {
		drawerStore.open({});
	}
	function drawerClose(): void {
		drawerStore.close();
	}

	function isTickerArticle(value: unknown): value is ClassicNewsArticle {
		if (typeof value !== 'object' || value === null) {
			return false;
		}

		const article = value as Partial<ClassicNewsArticle>;

		return (
			(typeof article.id === 'number' || typeof article.id === 'string') &&
			typeof article.title === 'string' &&
			(article.created_at instanceof Date ||
				typeof article.created_at === 'string')
		);
	}

	function getTickerArticles(value: unknown): ClassicNewsArticle[] {
		return Array.isArray(value)
			? value.filter(isTickerArticle).slice(0, 5)
			: [];
	}

	function formatClassicTickerDate(value: Date | string): string {
		const date = value instanceof Date ? value : new Date(value);

		if (!Number.isFinite(date.getTime())) {
			return '';
		}

		return `${classicTickerMonths[date.getUTCMonth()]} ${String(
			date.getUTCDate(),
		).padStart(2, '0')} ${date.getUTCFullYear()}`;
	}

	function makeTickerSummarySegments(
		article: ClassicNewsArticle,
	): ClassicTickerSegment[] {
		return typeof article.content === 'string'
			? summarizeTickerSegments(article.content)
			: [];
	}

	function summarizeTickerSegments(value: string): ClassicTickerSegment[] {
		return makeTickerTextSegments(
			value
				.replace(/```[\s\S]*?```/g, ' ')
				.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
				.replace(/^\s*[-*+]\s+/gm, '')
				.replace(/\s+/g, ' ')
				.trim(),
		);
	}

	function makeTickerTextSegments(value: string): ClassicTickerSegment[] {
		const linkPattern =
			/\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s)]+|www\.[^\s)]+)/g;
		const segments: ClassicTickerSegment[] = [];
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
		segments: ClassicTickerSegment[],
		value: string,
		kind: ClassicTickerSegment['kind'],
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

	function makeClassicPreviewHref(
		currentUrl: URL,
		path: string,
		hash = '',
	): string {
		const nextUrl = makeClassicPreviewUrl(currentUrl, path);
		nextUrl.hash = hash;

		return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
	}

	function makeClassicPreviewUrl(currentUrl: URL, path: string): URL {
		const nextUrl = new URL(
			themePreviewHref(currentUrl, path),
			currentUrl.origin,
		);
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
	let topbarStats: Required<ClassicTopbarStats> = {
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
		stats: ClassicTopbarStats | null | undefined,
	): Required<ClassicTopbarStats> {
		return {
			twitchChannels: normalizeTopbarCount(stats?.twitchChannels),
			twitchViewers: normalizeTopbarCount(stats?.twitchViewers),
			youtubeChannels: normalizeTopbarCount(stats?.youtubeChannels),
			youtubeViewers: normalizeTopbarCount(stats?.youtubeViewers),
		};
	}

	$: isClassicThemePreview =
		$page.url.searchParams.get('themePreview') === 'classic';
	$: effectiveTopbarStats = classicReference
		? {
				twitchChannels: classicReference.topbarStats[0]?.[0] ?? 0,
				twitchViewers: classicReference.topbarStats[0]?.[1] ?? 0,
				youtubeChannels: classicReference.topbarStats[1]?.[0] ?? 0,
				youtubeViewers: classicReference.topbarStats[1]?.[1] ?? 0,
			}
		: isClassicThemePreview
			? {
					twitchChannels: 0,
					twitchViewers: 0,
					youtubeChannels: 0,
					youtubeViewers: 0,
				}
			: topbarStats;
	$: effectiveOnlinePlayerCount = classicReference
		? Number(classicReference.onlineCount.replace(/[^0-9]/g, ''))
		: isClassicThemePreview
			? 0
			: onlinePlayerCount;

	const formatTopbarCount = (value: number | null): string =>
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
		try {
			const response = await fetch('/api/online-status');
			if (!response.ok) return;

			const status = (await response.json()) as {
				onlinePlayerCount?: number;
				topbarStats?: ClassicTopbarStats;
			} | null;
			if (!status || !Number.isFinite(status.onlinePlayerCount)) return;
			const nextTopbarStats = normalizeTopbarStats(status.topbarStats);
			onlinePlayerCount = normalizeTopbarCount(status.onlinePlayerCount);
			topbarStats = nextTopbarStats;
		} catch {
			// Keep the last successful values until the next poll succeeds.
		}
	}

	onMount(() => {
		void refreshOnlineStatus();
		const interval = setInterval(refreshOnlineStatus, 5000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	{#if fontStyle}{@html `<style>${fontStyle}</style>`}{/if}
</svelte:head>

<div
	class={`theme-classic${
		layout === 'compact-wide' ? ' theme-classic--wide' : ''
	}${isCompactNewsToolPage ? ' theme-classic--compact-news' : ''}`}
	style={shellStyle}>
	<div
		class="theme-classic__background {!background
			? 'theme-classic__background--placeholder'
			: ''}"
		style:background-image={background ? `url("${background}")` : undefined}>
	</div>
	{#if showClassicGrid}
		<div class="theme-classic__alignment-grid" aria-hidden="true">
			<span>32px SQM grid</span>
		</div>
	{/if}

	{#if isAdmin}
		<div class="theme-classic__admin">
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
		<div class="theme-classic__drawer">
			<Menu {isLoggedIn} {staticPages} assets={data.themeAssets} />
		</div>
	</Drawer>

	<div class="theme-classic__shell">
		<aside class="theme-classic__left">
			<a href={homeHref} class="theme-classic__logo" aria-label={PUBLIC_TITLE}>
				{#if logo}
					<img src={logo} alt={PUBLIC_TITLE} />
				{:else}
					<span>{PUBLIC_TITLE}</span>
				{/if}
			</a>
			{#if menuOrnament}
				<img class="theme-classic__ornament" src={menuOrnament} alt="" />
			{/if}

			<section class="theme-classic__account-box" style={accountButtonStyle}>
				<div class="theme-classic__account-panel">
					{#if isLoggedIn}
						<a
							class="theme-classic__image-button theme-classic__image-button--medium"
							href={accountHref}>
							{#if myAccountButton}
								<img src={myAccountButton} alt={$_('my-account')} />
							{:else}
								<span>{$_('my-account')}</span>
							{/if}
						</a>
						<form
							action={themePreviewHref($page.url, '/account/logout')}
							method="post">
							<button class="theme-classic__create-account-link" type="submit">
								{#if logoutButton}
									<img src={logoutButton} alt={$_('logout')} />
								{:else}
									<span>{$_('logout')}</span>
								{/if}
							</button>
						</form>
					{:else}
						<a
							class={`theme-classic__image-button theme-classic__image-button--medium ${
								loginButton ? 'theme-classic__image-button--rendered' : ''
							}`}
							href={accountLoginHref}>
							{#if loginButton}
								<img src={loginButton} alt={$_('login')} />
							{:else}
								<span>{$_('login')}</span>
							{/if}
						</a>
						<a
							class="theme-classic__create-account-link theme-classic__create-account-link--loginbox"
							href={accountSignupHref}>
							{#if loginCreateAccountText}
								<img src={loginCreateAccountText} alt={$_('create-account')} />
							{:else if createAccountButton}
								<img
									class="theme-classic__create-account-link-fallback"
									src={createAccountButton}
									alt={$_('create-account')} />
							{:else}
								<span>{$_('create-account')}</span>
							{/if}
						</a>
					{/if}
				</div>
				<div class="theme-classic__download-panel">
					<a
						class={`theme-classic__image-button theme-classic__image-button--medium ${
							downloadButton ? 'theme-classic__image-button--rendered' : ''
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

		<section class="theme-classic__center">
			<div class="theme-classic__center-spacer"></div>
			<header class="theme-classic__topbar theme-classic__center-chrome">
				<button
					class="theme-classic__mobile-menu"
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
					class="theme-classic__ticker theme-classic__center-chrome"
					style={contentChromeStyle}>
					<header>
						{#if headlineNewsTicker}
							<img
								class="theme-classic__headline-image"
								src={headlineNewsTicker}
								alt="News Ticker" />
						{:else if contentOrnament}
							<img src={contentOrnament} alt="" aria-hidden="true" />
							<h2>News Ticker</h2>
						{:else}
							<h2>News Ticker</h2>
						{/if}
					</header>
					<div class="theme-classic__ticker-body">
						{#each tickerItems as item, index}
							<input
								class="theme-classic__ticker-toggle"
								type="checkbox"
								bind:checked={expandedTickers[index]}
								id={`theme-classic-ticker-${index}`} />
							<label
								class={`theme-classic__ticker-row ${
									index % 2 === 0
										? 'theme-classic__ticker-row--odd'
										: 'theme-classic__ticker-row--even'
								}`}
								for={`theme-classic-ticker-${index}`}
								data-news-href={item.href}>
								{#if item.icon.startsWith('/theme-assets/classic/')}
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
								<span class="theme-classic__ticker-date">{item.date}</span>
								<!-- prettier-ignore -->
								<span class="theme-classic__ticker-copy">{#each item.copySegments as segment}{#if segment.href}<a class="theme-classic__ticker-link" href={themePreviewHref($page.url, segment.href)}>{segment.text}</a>{:else}{segment.text}{/if}{/each}</span>
								<span class="theme-classic__ticker-control" aria-hidden="true"
								></span>
							</label>
						{/each}
					</div>
				</section>
			{/if}

			<ContentFrame
				{title}
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
							: (information?.headline.src ??
								(nativePage ? data.themeAssets?.[nativePage.headline] : null) ??
								null)}
				headlineWidth={information?.headline.width ??
					nativePage?.headlineWidth ??
					(isEventSchedulePage ? 192 : 250)}
				headlineHeight={information?.headline.height ??
					nativePage?.headlineHeight ??
					(isEventSchedulePage ? 32 : 28)}
				compact={isCompactNewsToolPage}
				paperMinHeight={nativePage
					? nativePage.paperMinHeight
					: isInformationPage
						? 0
						: layout === 'compact-wide'
							? 640
							: layout === 'compact'
								? 241
								: 620}
				{paperTexture}>
				{#if nativePage}
					<div
						class="classic-native-content"
						style={`--classic-native-button: url("${classicAsset(data.themeAssets, 'smallButtonBackground') ?? ''}"); --classic-native-button-hover: url("${classicAsset(data.themeAssets, 'smallButtonHover') ?? ''}")`}>
						<slot />
					</div>
				{:else}<slot />{/if}
			</ContentFrame>

			<footer class="theme-classic__footer">
				<div>Powered by SlenderAAC · OpenTibiaBR</div>
				<div>
					<a href={themePreviewHref($page.url, '/about/company')}
						>About OpenTibiaBR</a>
					|
					<a href={presentationHref('agreement', '/pages/rules')}
						>Service Agreement</a>
					|
					<a href={presentationHref('privacy', '/pages/privacy')}
						>Privacy Policy</a>
				</div>
			</footer>
		</section>

		<aside class="theme-classic__right">
			<div class="theme-classic__right-spacer">
				<a
					class="theme-classic__theme-switch"
					href={themeSwitchHref}
					aria-label="Preview normal Slender layout">
					Slender
				</a>
				{#if rightTopper}
					<img
						class="theme-classic__pedestal"
						src={rightTopper}
						alt=""
						aria-hidden="true" />
				{/if}
				<a
					class="theme-classic__right-boost theme-classic__right-boost--creature"
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
					class="theme-classic__right-boost theme-classic__right-boost--boss"
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
					class="theme-classic__official-box theme-classic__official-box--premium"
					style={premiumButtonStyle}
					aria-label={`${premiumOfferText} ${premiumButtonText}`}
					href={shopHref}>
					<img src={promoPremiumBox} alt="Webshop" />
					{#if premiumCrown}
						<img
							class="theme-classic__premium-crown"
							src={premiumCrown}
							alt=""
							aria-hidden="true" />
					{/if}
					{#if premiumPromoArt}
						<span class="theme-classic__premium-art">
							<img src={premiumPromoArt} alt="" aria-hidden="true" />
						</span>
					{/if}
					{#if premiumOverlay}
						<img
							class="theme-classic__premium-overlay"
							src={premiumOverlay}
							alt=""
							aria-hidden="true" />
					{/if}
					<strong class="theme-classic__premium-offer">
						{premiumOfferText}
					</strong>
					<span class="theme-classic__premium-button">
						{#if premiumButtonLabel}
							<img
								class="theme-classic__premium-button-label"
								src={premiumButtonLabel}
								alt=""
								aria-hidden="true" />
						{/if}
						<span class:sr-only={!!premiumButtonLabel}
							>{premiumButtonText}</span>
						{#if premiumButtonDecor}<img
								class="theme-classic__premium-button-decor"
								src={premiumButtonDecor}
								alt=""
								aria-hidden="true" />{/if}
					</span>
				</a>
			{/if}

			{#if promoNetworksBox}
				<div
					class="theme-classic__official-box theme-classic__official-box--network">
					<img src={promoNetworksBox} alt="Networks" />
					<div class="theme-classic__network-links">
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
						<a
							href={presentationHref(
								'networkYoutube',
								'https://www.youtube.com/',
							)}
							target="_blank"
							rel="noreferrer">
							{#if networkYoutube}
								<img src={networkYoutube} alt="YouTube" />
							{:else}
								<Fa icon={faBookBookmark} />
							{/if}
						</a>
					</div>
				</div>
			{/if}

			{#if showAuxiliaryThemeboxes && promoTrailerBox}
				<a
					class="theme-classic__official-box theme-classic__official-box--trailer"
					data-classic-media="video"
					href={presentationHref(
						'trailer',
						'https://www.youtube.com/watch?v=OpAaLT_PTCU',
					)}
					aria-label="Play Tibia trailer">
					<img src={promoTrailerBox} alt="Trailer" />
					{#if trailerPreview}
						<img
							class="theme-classic__trailer-preview"
							src={trailerPreview}
							alt="" />
					{/if}
				</a>
			{/if}

			{#if showAuxiliaryThemeboxes && promoScreenshotBox}
				<a
					class="theme-classic__official-box theme-classic__official-box--screenshot"
					href={presentationHref(
						'screenshot',
						'https://www.tibia.com/abouttibia/?subtopic=screenshots',
					)}
					aria-label="Screenshot of the day">
					<img src={promoScreenshotBox} alt="Screenshots" />
					{#if promoScreenshotFrame && promoScreenshotImage}
						<div class="theme-classic__screenshot-image-clip">
							<span
								class="theme-classic__screenshot-image"
								style={`background-image: url("${promoScreenshotImage}")`}
							></span>
						</div>
						<img
							class="theme-classic__screenshot-frame"
							src={promoScreenshotFrame}
							alt=""
							aria-hidden="true" />
					{/if}
				</a>
			{/if}

			{#if !isCompactNewsToolPage && promoPollBox}
				<div
					class="theme-classic__official-box theme-classic__official-box--poll"
					style={pollBoxStyle}>
					<img src={promoPollBox} alt="Current Poll" />
					<strong class="theme-classic__poll-question">
						<span
							>{#if classicReference?.pollText ?? presentation?.pollText}{classicReference?.pollText ??
									presentation?.pollText}{:else}Guess the Date of<br />the
								Update!{/if}</span>
					</strong>
					<a
						class="theme-classic__poll-button"
						href={presentationHref(
							'poll',
							'https://www.tibia.com/community/?subtopic=polls',
						)}>Vote Now</a>
					<span class="theme-classic__poll-bottom" aria-hidden="true"></span>
				</div>
			{/if}
			{#if promoFansitesBox}
				<div
					class="theme-classic__official-box theme-classic__official-box--fansites"
					style={fansitesBoxStyle}>
					<img src={promoFansitesBox} alt="Fansites" />
					<a
						class="theme-classic__fansite-logo-frame"
						href={presentationHref('fansite', fansitesHref)}
						target="_blank"
						rel="noreferrer"
						aria-label="Featured fansite">
						{#if fansiteLogo}
							<img src={fansiteLogo} alt="" aria-hidden="true" />
						{/if}
					</a>
					<a class="theme-classic__fansite-button" href={fansitesHref}>
						View all Fansites
					</a>
				</div>
			{/if}
		</aside>
	</div>
	<MediaDialog {trailerFrame} {trailerClose} />
</div>

<style>
	.theme-classic {
		position: relative;
		box-sizing: border-box;
		min-height: 100vh;
		padding: 8px 0 0;
		display: flow-root;
		background: rgb(5 17 34);
		color: rgb(42 27 17);
		font-family: Verdana, Arial, ui-sans-serif, system-ui, sans-serif;
	}

	.theme-classic .theme-classic__background {
		position: absolute;
		inset: 0;
		z-index: 0;
		background-color: rgb(5 17 34);
		background-position: top center;
		background-repeat: no-repeat;
		background-size: 1600px auto;
	}

	.theme-classic .theme-classic__background--placeholder {
		background:
			radial-gradient(circle at top, rgb(68 48 30), transparent 44rem),
			linear-gradient(180deg, rgb(17 16 14), rgb(45 32 22));
	}

	.theme-classic .theme-classic__shell {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns:
			180px minmax(
				var(--classic-center-minimum, 0px),
				var(--classic-center-width, 865px)
			)
			180px;
		align-items: start;
		column-gap: var(--classic-column-gap, 14px);
		row-gap: 12px;
		width: min(
			var(--classic-shell-width, 1263px),
			calc(100% - var(--classic-shell-gutter, 24px))
		);
		margin: 0 auto -3px;
		left: var(--classic-shell-left, 5.5px);
		top: -3px;
	}

	.theme-classic:not(.theme-classic--compact-news) {
		--classic-shell-width: 1253px;
		--classic-shell-left: 0.5px;
		--classic-shell-gutter: 27px;
	}

	.theme-classic.theme-classic--wide {
		--classic-center-width: 915px;
		--classic-column-gap: 7px;
		--classic-shell-width: 1299px;
		--classic-shell-left: 22.5px;
		--classic-left-offset: 1px;
		--classic-center-offset: 10px;
		--classic-right-offset: 18px;
	}

	.theme-classic .theme-classic__alignment-grid {
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

	.theme-classic .theme-classic__alignment-grid span {
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

	.theme-classic .theme-classic__left,
	.theme-classic .theme-classic__right {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.theme-classic .theme-classic__right {
		margin-right: -10px;
		padding-right: 10px;
		transform: translateX(var(--classic-right-offset, 3px));
	}

	.theme-classic .theme-classic__left {
		gap: 4px;
		transform: translateX(var(--classic-left-offset, 0px));
	}

	.theme-classic .theme-classic__center {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 8px;
		transform: translateX(var(--classic-center-offset, 2px));
	}

	.theme-classic .theme-classic__center-spacer {
		height: 146px;
		flex: 0 0 146px;
	}

	.theme-classic .theme-classic__logo {
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

	.theme-classic .theme-classic__logo img {
		max-width: 196px;
		max-height: 158px;
		object-fit: contain;
		transform: translate(-1px, -2px);
	}

	.theme-classic .theme-classic__ornament {
		width: 180px;
		height: 12px;
		max-width: 100%;
		object-fit: contain;
		visibility: hidden;
	}

	.theme-classic .theme-classic__account-box {
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

	.theme-classic .theme-classic__account-panel,
	.theme-classic .theme-classic__download-panel {
		position: relative;
		display: flex;
		width: 180px;
		flex-direction: column;
		align-items: center;
		border: 0;
		background-image:
			var(--classic-chain, none), var(--classic-chain, none),
			var(--classic-loginbox-background, none);
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

	.theme-classic .theme-classic__account-panel {
		gap: 2px;
		padding: 3px 14px;
	}

	.theme-classic .theme-classic__download-panel {
		padding: 3px 14px;
	}

	.theme-classic .theme-classic__account-panel::before,
	.theme-classic .theme-classic__account-panel::after,
	.theme-classic .theme-classic__download-panel::before,
	.theme-classic .theme-classic__download-panel::after {
		position: absolute;
		right: 0;
		left: 0;
		height: 12px;
		background-repeat: repeat-x;
		background-size: auto 12px;
		content: '';
		pointer-events: none;
	}

	.theme-classic .theme-classic__account-panel::before,
	.theme-classic .theme-classic__download-panel::before {
		top: -10px;
		background-image: var(--classic-small-box-top, var(--classic-chain, none));
	}

	.theme-classic .theme-classic__account-panel::after,
	.theme-classic .theme-classic__download-panel::after {
		bottom: -10px;
		background-image: var(
			--classic-small-box-bottom,
			var(--classic-chain, none)
		);
	}

	.theme-classic .theme-classic__account-box form {
		margin: 0;
	}

	.theme-classic .theme-classic__image-button {
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

	.theme-classic .theme-classic__image-button--small {
		width: 135px;
		height: 25px;
		background: var(
				--classic-small-button,
				linear-gradient(180deg, rgb(35 65 236), rgb(8 7 139))
			)
			center / 100% 100% no-repeat;
	}

	.theme-classic .theme-classic__image-button--medium {
		width: 150px;
		height: 37px;
		background: var(
				--classic-medium-button,
				linear-gradient(180deg, rgb(35 65 236), rgb(8 7 139))
			)
			center / 100% 100% no-repeat;
	}

	.theme-classic
		.theme-classic__image-button--medium.theme-classic__image-button--rendered {
		background: transparent;
	}

	.theme-classic .theme-classic__image-button--small:hover,
	.theme-classic .theme-classic__image-button--small:focus {
		background: var(
				--classic-small-button-hover,
				linear-gradient(180deg, rgb(54 86 255), rgb(11 9 169))
			)
			center / 100% 100% no-repeat;
	}

	.theme-classic .theme-classic__image-button--medium:hover,
	.theme-classic .theme-classic__image-button--medium:focus {
		background: var(
				--classic-medium-button-hover,
				linear-gradient(180deg, rgb(54 86 255), rgb(11 9 169))
			)
			center / 100% 100% no-repeat;
	}

	.theme-classic
		.theme-classic__image-button--medium.theme-classic__image-button--rendered:hover,
	.theme-classic
		.theme-classic__image-button--medium.theme-classic__image-button--rendered:focus {
		background: transparent;
	}

	.theme-classic .theme-classic__image-button img {
		display: block;
		max-width: 100%;
		height: auto;
	}

	.theme-classic .theme-classic__create-account-link {
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

	.theme-classic .theme-classic__create-account-link--loginbox {
		min-height: 11px;
		align-items: flex-start;
	}

	.theme-classic .theme-classic__create-account-link img {
		display: block;
		max-width: 124px;
		height: auto;
	}

	.theme-classic
		.theme-classic__create-account-link--loginbox
		img:not(.theme-classic__create-account-link-fallback) {
		width: 124px;
		height: 11px;
		object-fit: contain;
	}

	.theme-classic .theme-classic__image-button:hover img,
	.theme-classic .theme-classic__image-button:focus img {
		filter: brightness(1.15);
	}

	.theme-classic .theme-classic__center-chrome {
		position: relative;
		border: 0;
		background:
			var(--classic-info-frame-edge, none) left top 4px / 5px 5px no-repeat,
			var(--classic-info-frame-edge, none) right top 4px / 5px 5px no-repeat,
			var(--classic-info-frame-edge, none) left bottom 4px / 5px 5px no-repeat,
			var(--classic-info-frame-edge, none) right bottom 4px / 5px 5px no-repeat,
			var(--classic-info-frame-vertical, none) left top 5px / 3px 13px repeat-y,
			var(--classic-info-frame-vertical, none) right top 5px / 3px 13px repeat-y,
			var(--classic-content-border, none)
				var(--classic-center-chrome-top-border-position, -1px 0) / 16px 6px
				repeat-x,
			var(--classic-content-border, none)
				var(--classic-center-chrome-bottom-border-position, -1px bottom) / 16px
				6px repeat-x,
			var(--classic-center-chrome-fill, rgb(35 35 34));
		image-rendering: pixelated;
	}

	.theme-classic .theme-classic__center-chrome::before,
	.theme-classic .theme-classic__center-chrome::after {
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

	.theme-classic .theme-classic__center-chrome::before {
		top: -4px;
		background-image:
			var(--classic-info-corner-tl, none), var(--classic-info-corner-tr, none);
		background-position:
			left top,
			right top;
	}

	.theme-classic .theme-classic__center-chrome::after {
		bottom: -4px;
		background-image:
			var(--classic-info-corner-bl, none), var(--classic-info-corner-br, none);
		background-position:
			left top,
			right top;
	}

	.theme-classic .theme-classic__topbar {
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
		--classic-info-frame-edge: var(--classic-content-frame-edge, none);
		--classic-info-frame-vertical: var(--classic-content-frame-vertical, none);
		--classic-center-chrome-top-border-position: 1px 0;
		--classic-center-chrome-bottom-border-position: 1px bottom;
		--classic-center-chrome-fill:
			var(--classic-cache-title, var(--classic-news-headline, none)) 1px 6px /
				83px 28px repeat-x,
			rgb(93 14 10);
		box-shadow: none;
		color: rgb(242 226 195);
		font-family: Verdana, Arial, Helvetica, sans-serif;
		font-size: 10px;
		font-weight: 700;
		line-height: 1;
	}

	.theme-classic .theme-classic__topbar.theme-classic__center-chrome::before {
		background-position:
			left top,
			calc(100% - 2px) top;
	}

	.theme-classic .theme-classic__topbar.theme-classic__center-chrome::after {
		background-position:
			-1px top,
			calc(100% - 1px) top;
	}

	.theme-classic .theme-classic__ticker {
		position: relative;
		--classic-center-chrome-fill: rgb(222 187 157);
		--classic-center-chrome-top-border-position: 1px -1px;
		--classic-center-chrome-bottom-border-position: 1px calc(100% - 1px);
		margin-top: 10px;
		margin-bottom: 10px;
		padding: 6px 6px 6px;
		background:
			var(--classic-info-frame-edge, none) left top 4px / 5px 5px no-repeat,
			var(--classic-info-frame-edge, none) right top 4px / 5px 5px no-repeat,
			var(--classic-info-frame-edge, none) left bottom 4px / 5px 5px no-repeat,
			var(--classic-info-frame-edge, none) right bottom 4px / 5px 5px no-repeat,
			linear-gradient(rgb(58 55 56), rgb(58 55 56)) left -1px top 5px / 2px
				calc(100% - 10px) no-repeat,
			linear-gradient(rgb(58 55 56), rgb(58 55 56)) right -1px top 5px / 2px
				calc(100% - 10px) no-repeat,
			var(--classic-content-border, none)
				var(--classic-center-chrome-top-border-position, -1px 0) / 16px 6px
				repeat-x,
			var(--classic-content-border, none)
				var(--classic-center-chrome-bottom-border-position, -1px bottom) / 16px
				6px repeat-x,
			var(--classic-center-chrome-fill, rgb(35 35 34));
		box-shadow: none;
	}

	.theme-classic .theme-classic__ticker.theme-classic__center-chrome::before {
		top: -5px;
		width: calc(100% + 3px);
		background-image:
			var(--classic-ticker-corner-tl, var(--classic-info-corner-tl, none)),
			var(--classic-ticker-corner-tr, var(--classic-info-corner-tr, none));
	}

	.theme-classic .theme-classic__ticker.theme-classic__center-chrome::after {
		bottom: -3px;
		width: calc(100% + 4px);
		background-image:
			var(--classic-ticker-corner-bl, var(--classic-info-corner-bl, none)),
			var(--classic-ticker-corner-br, var(--classic-info-corner-br, none));
		background-position:
			-1px top,
			right top;
	}

	.theme-classic .theme-classic__ticker header {
		display: flex;
		align-items: flex-start;
		gap: 0;
		height: 24px;
		min-height: 24px;
		margin: 0 -4px;
		padding: 0 14px 0 5px;
		border: 0;
		background:
			var(--classic-content-title, none) repeat-x,
			linear-gradient(180deg, rgb(31 74 23), rgb(20 48 16));
		background-position:
			0 1px,
			0 0;
		color: rgb(240 224 178);
	}

	.theme-classic .theme-classic__ticker header img {
		width: 16px;
		height: 16px;
		image-rendering: pixelated;
	}

	.theme-classic .theme-classic__ticker header .theme-classic__headline-image {
		width: 250px;
		height: 28px;
		image-rendering: pixelated;
		object-fit: none;
		object-position: left top;
		transform: translateY(0);
	}

	.theme-classic .theme-classic__ticker h2 {
		margin: 0;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 25px;
		font-weight: 800;
		line-height: 1;
		text-shadow:
			1px 1px 0 rgb(0 0 0),
			0 0 8px rgb(0 0 0 / 0.75);
	}

	.theme-classic .theme-classic__ticker-body {
		position: relative;
		box-sizing: border-box;
		min-height: 120px;
		margin: 0 -4px;
		padding: 10px 10px 6px;
	}
	.theme-classic .theme-classic__ticker-body::before {
		position: absolute;
		inset: 4px;
		border: 1px solid rgb(121 61 3);
		background: rgb(255 242 219);
		content: '';
		pointer-events: none;
	}

	.theme-classic .theme-classic__ticker-toggle {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: 0;
		opacity: 0;
		pointer-events: none;
	}

	.theme-classic .theme-classic__ticker-row {
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

	.theme-classic .theme-classic__ticker-row--odd {
		background: rgb(212 192 161);
	}

	.theme-classic .theme-classic__ticker-row--even {
		background: rgb(241 224 198);
	}

	.theme-classic
		.theme-classic__ticker-toggle:checked
		+ .theme-classic__ticker-row {
		height: auto;
		min-height: 34px;
		padding-left: 112px;
		white-space: normal;
	}

	.theme-classic .theme-classic__ticker-control {
		position: absolute;
		top: 3px;
		right: 3px;
		z-index: 2;
		width: 12px;
		height: 12px;
		background: var(--classic-ticker-expand, none) center / 12px 12px no-repeat;
		cursor: pointer;
		content: '';
		image-rendering: pixelated;
	}

	.theme-classic
		.theme-classic__ticker-toggle:checked
		+ .theme-classic__ticker-row
		.theme-classic__ticker-control {
		background-image: var(
			--classic-ticker-collapse,
			var(--classic-ticker-expand, none)
		);
	}

	.theme-classic .theme-classic__ticker-row > img {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		flex: 0 0 16px;
		image-rendering: pixelated;
	}

	.theme-classic .theme-classic__ticker-body span {
		margin-right: 0;
		color: rgb(90 40 0);
	}

	.theme-classic .theme-classic__ticker-date {
		position: absolute;
		top: 2px;
		left: 22px;
		display: block;
		margin-left: 0;
		overflow: visible;
		white-space: nowrap;
	}

	.theme-classic .theme-classic__ticker-copy {
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

	.theme-classic
		.theme-classic__ticker-toggle:checked
		+ .theme-classic__ticker-row
		.theme-classic__ticker-copy {
		position: static;
		height: auto;
		min-height: 30px;
		white-space: normal;
	}

	.theme-classic
		.theme-classic__ticker-toggle:focus-visible
		+ .theme-classic__ticker-row {
		outline: 1px solid rgb(0 66 148);
		outline-offset: -1px;
	}

	.theme-classic .theme-classic__ticker-link {
		color: rgb(0 66 148);
		font-weight: 700;
	}

	.theme-classic .theme-classic__footer a {
		color: rgb(255 255 255);
		text-decoration: none;
	}

	.theme-classic .theme-classic__footer a:hover {
		color: white;
		text-decoration: underline;
	}

	.theme-classic .theme-classic__mobile-menu {
		display: none;
		width: 34px;
		height: 34px;
		align-items: center;
		justify-content: center;
		border: 1px solid rgb(116 82 45);
		background: rgb(62 37 24);
		color: rgb(252 231 177);
	}

	.theme-classic .theme-classic__drawer {
		padding: 12px;
	}

	.theme-classic .theme-classic__footer {
		margin-top: 10px;
		margin-left: -5px;
		width: calc(100% + 10px);
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

	.theme-classic .theme-classic__footer div + div {
		margin-top: 0;
	}

	.theme-classic .theme-classic__admin {
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

	.theme-classic .theme-classic__admin a {
		display: flex;
		align-items: center;
		gap: 6px;
		color: white;
		font-weight: 700;
		text-decoration: none;
	}

	.theme-classic .theme-classic__right-spacer {
		position: relative;
		display: flex;
		height: 140px;
		align-items: flex-end;
		justify-content: center;
	}

	.theme-classic .theme-classic__theme-switch {
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

	.theme-classic .theme-classic__theme-switch:hover,
	.theme-classic .theme-classic__theme-switch:focus {
		border-color: rgb(180 142 76);
		background: rgb(52 30 18 / 0.92);
		color: white;
	}

	.theme-classic .theme-classic__pedestal {
		display: block;
		max-width: 161px;
		height: auto;
		transform: translate(1px, 15px);
	}

	.theme-classic .theme-classic__right-boost {
		position: absolute;
		bottom: 30px;
		z-index: 2;
		width: 46px;
		height: 42px;
		transform: translateY(15px);
		pointer-events: auto;
	}

	.theme-classic .theme-classic__right-boost--creature {
		left: 23px;
	}

	.theme-classic .theme-classic__right-boost--boss {
		left: 80px;
	}

	.theme-classic .theme-classic__right-boost > img {
		position: absolute;
		top: -24px;
		left: -9px;
		z-index: 1;
		width: 64px;
		max-width: none;
		height: 64px;
		object-fit: contain;
	}

	:global(.theme-classic .theme-classic__boosted-avatar) {
		z-index: 2;
		width: 46px;
		height: 42px;
		overflow: visible;
	}

	:global(.theme-classic .theme-classic__boosted-avatar-inner) {
		left: -18px !important;
		bottom: -16px !important;
	}

	:global(.theme-classic .theme-classic__boosted-avatar canvas) {
		width: 72px !important;
		height: 72px !important;
	}

	.theme-classic .theme-classic__network-links a:hover {
		filter: brightness(1.12);
	}

	.theme-classic .theme-classic__network-links :global(svg) {
		width: 22px;
		height: 22px;
	}

	.theme-classic .theme-classic__official-box {
		position: relative;
		display: block;
		width: 180px;
		overflow: hidden;
		color: rgb(242 226 195);
		text-decoration: none;
	}

	.theme-classic .theme-classic__official-box > img:first-child {
		display: block;
		width: 180px;
		height: auto;
	}

	.theme-classic .theme-classic__official-box--premium {
		overflow: visible;
		height: 204px;
	}

	.theme-classic .theme-classic__official-box--network {
		height: 98px;
	}

	.theme-classic .theme-classic__official-box--fansites {
		height: 188px;
		background: transparent;
	}

	.theme-classic .theme-classic__official-box--trailer {
		height: 153px;
		background: transparent;
	}

	.theme-classic .theme-classic__official-box--screenshot {
		height: 154px;
		background: transparent;
	}

	.theme-classic .theme-classic__official-box--network::after,
	.theme-classic .theme-classic__official-box--trailer::after,
	.theme-classic .theme-classic__official-box--screenshot::after,
	.theme-classic .theme-classic__official-box--fansites::after {
		position: absolute;
		bottom: 0;
		left: -1px;
		z-index: 3;
		display: block;
		width: 180px;
		height: 12px;
		background: var(--classic-right-themebox-bottom, transparent) center / 180px
			12px no-repeat;
		content: '';
		pointer-events: none;
	}

	.theme-classic .theme-classic__official-box--fansites::after {
		left: 0;
	}

	.theme-classic .theme-classic__official-box--poll {
		height: 154px;
	}

	.theme-classic .theme-classic__fansite-logo-frame {
		position: absolute;
		top: 31px;
		left: 0;
		display: block;
		width: 180px;
		height: 145px;
		background: var(--classic-fansites-logo-frame, transparent) center / 180px
			145px no-repeat;
	}

	.theme-classic .theme-classic__fansite-logo-frame img {
		position: absolute;
		top: 8px;
		left: 15px;
		display: block;
		width: 150px;
		height: 100px;
		max-width: none;
		object-fit: cover;
	}

	.theme-classic .theme-classic__fansite-button {
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
		font-weight: 400;
		line-height: 25px;
		text-align: center;
		text-decoration: none;
		text-shadow:
			-1px -1px 0 black,
			0 -1px 0 black,
			1px -1px 0 black,
			1px 0 0 black,
			1px 1px 0 black,
			0 1px 0 black,
			-1px 1px 0 black,
			-1px 0 0 black;
		background: var(--classic-fansites-button, rgb(17 37 154)) center / 135px
			25px no-repeat;
	}

	.theme-classic .theme-classic__poll-question {
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

	.theme-classic .theme-classic__poll-button {
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
		background: var(--classic-poll-button, rgb(17 37 154)) center / 135px 25px
			no-repeat;
	}

	.theme-classic .theme-classic__poll-button:hover {
		background-image: var(
			--classic-poll-button-hover,
			var(--classic-poll-button)
		);
	}

	.theme-classic .theme-classic__poll-bottom {
		position: absolute;
		top: 142px;
		left: 0;
		z-index: 3;
		display: block;
		width: 180px;
		height: 12px;
		background: var(--classic-poll-bottom, transparent) center / 180px 12px
			no-repeat;
		pointer-events: none;
	}

	.theme-classic .theme-classic__premium-art {
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

	.theme-classic .theme-classic__premium-art img {
		display: block;
		width: 160px;
		height: 126px;
		object-fit: cover;
	}

	.theme-classic .theme-classic__premium-crown,
	.theme-classic .theme-classic__premium-overlay,
	.theme-classic .theme-classic__premium-button-label {
		position: absolute;
		display: block;
		max-width: none;
		pointer-events: none;
	}

	.theme-classic .theme-classic__premium-crown {
		top: -28px;
		left: 5px;
		z-index: 2;
		width: 64px;
		height: 64px;
	}

	.theme-classic .theme-classic__premium-overlay {
		top: 34px;
		left: 10px;
		z-index: 3;
		width: 163px;
		height: 26px;
	}

	.theme-classic .theme-classic__premium-offer {
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

	.theme-classic .theme-classic__premium-button {
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
		background: var(--classic-premium-button, rgb(19 25 142)) center / 142px
			34px no-repeat;
	}

	.theme-classic .theme-classic__premium-button-decor {
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

	.theme-classic .theme-classic__premium-button-label {
		top: 2px;
		left: 1px;
		width: 140px;
		height: 30px;
	}

	.theme-classic
		.theme-classic__official-box--premium:hover
		.theme-classic__premium-button {
		background-image: var(
			--classic-premium-button-hover,
			var(--classic-premium-button)
		);
	}

	.theme-classic .theme-classic__premium-button span {
		display: block;
		transform: translateY(-1px);
	}

	.theme-classic .theme-classic__network-links {
		inset: 20px 12px auto;
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

	.theme-classic .theme-classic__network-links a {
		align-items: center;
		justify-content: center;
		color: rgb(44 27 17);
		font-size: 0;
		text-decoration: none;
		display: block;
		width: 30px;
		height: 53px;
		min-height: 0;
		border: 0;
		background: transparent;
		box-shadow: none;
		padding: 0;
	}

	.theme-classic .theme-classic__network-links img {
		display: block;
		width: 30px !important;
		max-width: none;
		height: 30px !important;
		object-fit: contain;
	}

	.theme-classic .theme-classic__trailer-preview {
		position: absolute;
		top: 31px;
		left: 5px;
		width: 170px !important;
		height: 110px !important;
	}

	.theme-classic .theme-classic__screenshot-image-clip {
		position: absolute;
		top: 35px;
		left: 5px;
		width: 170px;
		height: 102px;
		overflow: hidden;
	}

	.theme-classic .theme-classic__screenshot-image {
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

	.theme-classic .theme-classic__screenshot-frame {
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

	.theme-classic :global(.theme-classic-content-frame__paper .news-empty) {
		color: rgb(83 43 16);
		font-family: Verdana, Arial, sans-serif;
	}

	.theme-classic
		:global(.theme-classic-content-frame__paper .news-empty header.card) {
		position: relative;
		margin: 0 0 14px;
		min-height: 28px;
		padding-left: 34px;
		border: 1px solid rgb(80 12 8);
		border-radius: 0;
		background:
			var(--classic-news-headline, none) repeat-x,
			linear-gradient(180deg, rgb(153 24 16), rgb(84 12 8));
		color: rgb(255 244 210);
		box-shadow: inset 0 0 0 1px rgb(255 214 127 / 0.18);
		text-shadow: 1px 1px 0 rgb(0 0 0);
	}

	.theme-classic
		:global(
			.theme-classic-content-frame__paper .news-empty header.card::before
		) {
		position: absolute;
		top: 50%;
		left: 9px;
		width: 16px;
		height: 16px;
		transform: translateY(-50%);
		background: var(--classic-news-icon, none) center / contain no-repeat;
		content: '';
	}

	.theme-classic
		:global(.theme-classic-content-frame__paper .news-empty header.card svg) {
		display: none;
	}

	.theme-classic :global(.theme-classic-content-frame__paper .news-empty p) {
		margin: 18px 10px 0;
		max-width: 620px;
		color: rgb(78 39 14);
		line-height: 1.48;
	}

	.theme-classic
		:global(.theme-classic-content-frame__paper .news-empty p::first-letter) {
		float: left;
		margin: 0 6px 0 0;
		color: rgb(113 19 12);
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 34px;
		font-weight: 700;
		line-height: 0.85;
		text-shadow: 0 1px 0 rgb(255 245 207);
	}

	.theme-classic
		:global(.theme-classic-content-frame__paper > .w-full .divider) {
		display: none;
	}

	@media (max-width: 1280px) {
		.theme-classic .theme-classic__background {
			background-position: -170px top;
		}
	}

	@media (min-width: 981px) and (max-width: 1280px) {
		.theme-classic.theme-classic--compact-news .theme-classic__shell {
			grid-template-columns:
				180px minmax(var(--classic-center-minimum, 0px), 865px)
				180px;
			width: calc(100% - 27px);
			margin-left: 14px;
			margin-right: 0;
			left: 0;
		}
		.theme-classic.theme-classic--wide .theme-classic__shell {
			grid-template-columns: 180px 915px 180px;
			width: 1299px;
			margin-left: 13px;
		}
	}

	@media (max-width: 980px) {
		.theme-classic {
			padding: 12px 8px;
			overflow-x: clip;
		}

		.theme-classic .theme-classic__shell {
			grid-template-columns: minmax(0, 1fr);
			width: 100%;
			left: 0;
		}

		.theme-classic .theme-classic__center {
			transform: none;
		}

		.theme-classic .theme-classic__left,
		.theme-classic .theme-classic__right {
			display: none;
		}

		.theme-classic .theme-classic__topbar {
			flex-wrap: wrap;
			height: auto;
			min-height: 40px;
			padding: 8px;
			gap: 6px;
		}

		.theme-classic .theme-classic__mobile-menu {
			display: inline-flex;
		}

		.theme-classic .theme-classic__links {
			display: none;
		}
	}
</style>
