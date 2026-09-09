<script lang="ts">
	import {
		faBookBookmark,
		faDownload,
		faGifts,
		faNewspaper,
		faPeopleArrows,
		faRightFromBracket,
		faRightToBracket,
		faUser,
		faUserPlus,
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import { informationPages, informationPath } from '$lib/information';
	import { serverText } from '$lib/site-identity';
	import { featureMenuHref, featurePages } from '$lib/site-pages';
	import { themePreviewHref as withThemePreview } from '$lib/themes/preview';

	import { PUBLIC_DOWNLOAD_URL } from '$env/static/public';

	import { classicAsset } from './theme';

	type StaticPage = {
		title: string;
		slug: string;
	};

	export let isLoggedIn = false;
	export let staticPages: StaticPage[] = [];
	export let assets: Record<string, string | undefined> | null | undefined = {};
	export let showAccountActions = true;

	$: presentation = (
		$page.data as {
			classicPresentation?:
				| import('./reference-types').ClassicPresentation
				| null;
		}
	).classicPresentation;
	$: menuIdPrefix = showAccountActions
		? 'classic-menu-drawer'
		: 'classic-menu-main';
	$: currentPath = $page.url.pathname.replace(/\/$/, '') || '/';
	$: identity = { name: $page.data.serverName, website: $page.url.origin };
	$: aboutLabel = `About ${$page.data.serverName}`;
	$: aboutLinks = (
		presentation?.navigation.about ??
		informationPages
			.filter((entry) => entry.section === 'about')
			.map((entry) => ({ label: entry.title, href: informationPath(entry) }))
	).map((entry) => {
		const pathname = new URL(withThemePreview($page.url, entry.href), $page.url)
			.pathname;
		if (pathname === '/about/company')
			return { label: 'About OpenTibiaBR', href: '/about/company' };
		if (['/about/server', '/about/what-is-tibia'].includes(pathname))
			return { label: aboutLabel, href: '/about/server' };
		return entry;
	});
	$: guideLinks =
		presentation?.navigation.guides ??
		informationPages
			.filter((entry) => entry.section === 'guides')
			.map((entry) => ({ label: entry.title, href: informationPath(entry) }));
	function isActive(href: string, current = $page.url) {
		const target = new URL(withThemePreview(current, href), current);
		const pathname = current.pathname.replace(/\/$/, '') || '/';
		if (target.pathname === '/unavailable')
			return (
				pathname === target.pathname &&
				target.searchParams.get('feature') ===
					current.searchParams.get('feature')
			);
		return (
			target.pathname === pathname ||
			(target.pathname !== '/' && pathname.startsWith(`${target.pathname}/`))
		);
	}
	$: latestNewsHref = withThemePreview($page.url, '/');
	$: newsArchiveHref = withThemePreview($page.url, '/news/archive');
	$: eventScheduleHref = withThemePreview($page.url, '/news/event-schedule');
	$: communityLinks = (
		presentation?.navigation.community ?? [
			{ label: 'Characters', href: '/characters' },
			...Object.values(featurePages)
				.filter((entry) => entry.section === 'community')
				.map((entry) => ({ label: entry.title, href: entry.path })),
			{ label: 'Who Is Online?', href: '/online' },
			{ label: 'Highscores', href: '/highscores' },
			{ label: 'Guilds', href: '/guilds' },
		]
	).map((entry) => ({
		...entry,
		href: featureMenuHref('community', entry.label, entry.href),
	}));
	$: communityActive = communityLinks.some((entry) =>
		isActive(entry.href, $page.url),
	);
	$: accountPageHref = withThemePreview($page.url, '/account');
	$: accountLoginHref = withThemePreview($page.url, '/account/login');
	$: accountSignupHref = withThemePreview($page.url, '/account/signup');
	$: accountLostHref = withThemePreview($page.url, '/account/lost');
	$: rulesPage = staticPages.find((entry) => entry.slug === 'rules');
	$: accountHref = isLoggedIn ? accountPageHref : accountLoginHref;
	$: isLatestNewsActive = currentPath === '/';
	$: isNewsArchiveActive = currentPath === '/news/archive';
	$: isEventScheduleActive = currentPath === '/news/event-schedule';

	$: menuButtonBackground = classicAsset(assets, 'menuButtonBackground');
	$: menuButtonHover = classicAsset(assets, 'menuButtonHover');
	$: menuStyle = [
		menuButtonBackground
			? `--classic-menu-button: url("${menuButtonBackground}")`
			: '',
		menuButtonHover
			? `--classic-menu-button-hover: url("${menuButtonHover}")`
			: '',
	]
		.filter(Boolean)
		.join('; ');

	$: menuIcons = {
		news: classicAsset(assets, 'menuIconNews'),
		community: classicAsset(assets, 'menuIconCommunity'),
		library: classicAsset(assets, 'menuIconLibrary'),
		shop: classicAsset(assets, 'menuIconShop'),
		about: classicAsset(assets, 'menuIconAbout'),
		guides: classicAsset(assets, 'menuIconGameGuides'),
		characterTrade: classicAsset(assets, 'menuIconCharacterTrade'),
		account: classicAsset(assets, 'menuIconAccount'),
		forum: classicAsset(assets, 'menuIconForum'),
		support: classicAsset(assets, 'menuIconSupport'),
	};

	$: activeSubmenuIcon = classicAsset(assets, 'menuIconActiveSubmenu');
	$: expandPlus = classicAsset(assets, 'menuExpandPlus');
	$: expandMinus = classicAsset(assets, 'menuExpandMinus');
	$: greenLight = classicAsset(assets, 'menuGreenLight');
	$: boxTop = classicAsset(assets, 'boxTop');
	$: boxBottom = classicAsset(assets, 'boxBottom');
	$: chain = classicAsset(assets, 'chain');

	$: menuLabels = {
		news: classicAsset(assets, 'menuLabelNews'),
		community: classicAsset(assets, 'menuLabelCommunity'),
		library: classicAsset(assets, 'menuLabelLibrary'),
		shop: classicAsset(assets, 'menuLabelShop'),
		about: classicAsset(assets, 'menuLabelAbout'),
		guides: classicAsset(assets, 'menuLabelGameGuides'),
		characterTrade: classicAsset(assets, 'menuLabelCharacterTrade'),
		account: classicAsset(assets, 'menuLabelAccount'),
		forum: classicAsset(assets, 'menuLabelForum'),
		support: classicAsset(assets, 'menuLabelSupport'),
	};

	$: menuChromeStyle = [
		menuStyle,
		activeSubmenuIcon
			? `--classic-active-submenu: url("${activeSubmenuIcon}")`
			: '',
		expandPlus ? `--classic-expand-plus: url("${expandPlus}")` : '',
		expandMinus ? `--classic-expand-minus: url("${expandMinus}")` : '',
		greenLight ? `--classic-green-light: url("${greenLight}")` : '',
		boxTop ? `--classic-menu-box-top: url("${boxTop}")` : '',
		boxBottom ? `--classic-menu-box-bottom: url("${boxBottom}")` : '',
		chain ? `--classic-menu-chain: url("${chain}")` : '',
	]
		.filter(Boolean)
		.join('; ');
</script>

<nav
	class={`theme-classic-menu${
		!showAccountActions ? ' theme-classic-menu--main' : ''
	}`}
	aria-label="Main navigation"
	style={menuChromeStyle}>
	{#if showAccountActions}
		<section class="theme-classic-menu__account">
			{#if isLoggedIn}
				<a class="theme-classic-menu__action" href={accountPageHref}>
					<Fa icon={faUser} />
					{$_('my-account')}
				</a>
				<form
					action={withThemePreview($page.url, '/account/logout')}
					method="post">
					<button class="theme-classic-menu__action" type="submit">
						<Fa icon={faRightFromBracket} />
						{$_('logout')}
					</button>
				</form>
			{:else}
				<a class="theme-classic-menu__action" href={accountLoginHref}>
					<Fa icon={faRightToBracket} />
					{$_('login')}
				</a>
				<a class="theme-classic-menu__link-action" href={accountSignupHref}>
					<Fa icon={faUserPlus} />
					{$_('create-account')}
				</a>
			{/if}
			<a
				class="theme-classic-menu__action"
				href={withThemePreview($page.url, PUBLIC_DOWNLOAD_URL)}>
				<Fa icon={faDownload} />
				{$_('download')}
			</a>
		</section>
	{/if}

	<section>
		<input
			class="theme-classic-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-news-toggle`}
			checked />
		<h2>
			{#if menuIcons.news}
				<img src={menuIcons.news} alt="" aria-hidden="true" />
			{:else}
				<Fa icon={faNewspaper} />
			{/if}
			{#if menuLabels.news}
				<img
					class="theme-classic-menu__label"
					src={menuLabels.news}
					alt={$_('news')} />
			{:else}
				<span>{$_('news')}</span>
			{/if}
			<label
				class="theme-classic-menu__header-hitbox"
				for={`${menuIdPrefix}-news-toggle`}
				aria-label="Toggle News"></label>
			<label
				class="theme-classic-menu__toggle"
				for={`${menuIdPrefix}-news-toggle`}
				aria-label="Toggle News"></label>
		</h2>
		<div class="theme-classic-menu__submenu" id={`${menuIdPrefix}-news`}>
			<a
				class={isLatestNewsActive
					? 'theme-classic-menu__submenu-link--active'
					: undefined}
				href={latestNewsHref}>Latest News</a>
			<a
				class={isNewsArchiveActive
					? 'theme-classic-menu__submenu-link--active'
					: undefined}
				href={newsArchiveHref}>News Archive</a>
			<a
				class={isEventScheduleActive
					? 'theme-classic-menu__submenu-link--active'
					: undefined}
				href={eventScheduleHref}>Event Schedule</a>
		</div>
	</section>

	<section>
		<input
			class="theme-classic-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-about-toggle`}
			checked={currentPath.startsWith('/about/')} />
		<div class="theme-classic-menu__category">
			<span class="theme-classic-menu__category-link">
				{#if menuIcons.about}
					<img src={menuIcons.about} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faBookBookmark} />
				{/if}
				<span
					class="theme-classic-menu__text-label theme-classic-menu__server-label"
					title={aboutLabel}>{aboutLabel}</span>
			</span>
			<label
				class="theme-classic-menu__header-hitbox"
				for={`${menuIdPrefix}-about-toggle`}
				aria-label={`Toggle ${aboutLabel}`}></label>
			<label
				class="theme-classic-menu__toggle"
				for={`${menuIdPrefix}-about-toggle`}
				aria-label={`Toggle ${aboutLabel}`}></label>
		</div>
		<div class="theme-classic-menu__submenu" id={`${menuIdPrefix}-about`}>
			{#each aboutLinks as link}
				<a
					class:theme-classic-menu__submenu-link--active={isActive(link.href)}
					href={withThemePreview($page.url, link.href)}
					>{serverText(link.label, identity)}</a>
			{/each}
		</div>
	</section>

	<section>
		<input
			class="theme-classic-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-guides-toggle`}
			checked={currentPath.startsWith('/guides/')} />
		<div class="theme-classic-menu__category">
			<span class="theme-classic-menu__category-link">
				{#if menuIcons.guides}
					<img src={menuIcons.guides} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faBookBookmark} />
				{/if}
				{#if menuLabels.guides}
					<img
						class="theme-classic-menu__label"
						src={menuLabels.guides}
						alt="Game Guides" />
				{:else}
					<span class="theme-classic-menu__text-label">Game Guides</span>
				{/if}
			</span>
			<label
				class="theme-classic-menu__header-hitbox"
				for={`${menuIdPrefix}-guides-toggle`}
				aria-label="Toggle Game Guides"></label>
			<label
				class="theme-classic-menu__toggle"
				for={`${menuIdPrefix}-guides-toggle`}
				aria-label="Toggle Game Guides"></label>
		</div>
		<div class="theme-classic-menu__submenu" id={`${menuIdPrefix}-guides`}>
			{#each guideLinks as link}
				<a
					class:theme-classic-menu__submenu-link--active={isActive(link.href)}
					href={withThemePreview($page.url, link.href)}
					>{serverText(link.label, identity)}</a>
			{/each}
		</div>
	</section>

	<section>
		<input
			class="theme-classic-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-library-toggle`}
			checked={currentPath.startsWith('/library/')} />
		<div class="theme-classic-menu__category">
			<span class="theme-classic-menu__category-link">
				{#if menuIcons.library}
					<img src={menuIcons.library} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faBookBookmark} />
				{/if}
				{#if menuLabels.library}
					<img
						class="theme-classic-menu__label"
						src={menuLabels.library}
						alt={$_('library')} />
				{:else}
					<span>{$_('library')}</span>
				{/if}
			</span>
			<label
				class="theme-classic-menu__header-hitbox"
				for={`${menuIdPrefix}-library-toggle`}
				aria-label="Toggle Library"></label>
			<label
				class="theme-classic-menu__toggle"
				for={`${menuIdPrefix}-library-toggle`}
				aria-label="Toggle Library"></label>
		</div>
		<div class="theme-classic-menu__submenu" id={`${menuIdPrefix}-library`}>
			{#if presentation?.navigation.library}
				{#each presentation.navigation.library as link}
					<a
						class:theme-classic-menu__submenu-link--active={isActive(link.href)}
						href={withThemePreview($page.url, link.href)}
						>{serverText(link.label, identity)}</a>
				{/each}
			{:else}
				<a
					class:theme-classic-menu__submenu-link--active={isActive(
						'/library/creatures',
					)}
					href={withThemePreview($page.url, '/library/creatures')}>Creatures</a>
				<a
					class:theme-classic-menu__submenu-link--active={isActive(
						'/library/boostable-bosses',
					)}
					href={withThemePreview($page.url, '/library/boostable-bosses')}
					>Boostable Bosses</a>
				{#each Object.values(featurePages).filter((entry) => entry.section === 'library') as entry}
					<a
						class:theme-classic-menu__submenu-link--active={isActive(
							entry.path,
						)}
						href={withThemePreview($page.url, entry.path)}>{entry.title}</a>
				{/each}
				{#each staticPages as entry}
					<a
						href={withThemePreview(
							$page.url,
							`/pages/${encodeURIComponent(entry.slug)}`,
						)}>{entry.title}</a>
				{/each}
			{/if}
		</div>
	</section>

	<section>
		<input
			class="theme-classic-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-community-toggle`}
			checked={communityActive} />
		<div class="theme-classic-menu__category">
			<span class="theme-classic-menu__category-link">
				{#if menuIcons.community}
					<img src={menuIcons.community} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faPeopleArrows} />
				{/if}
				{#if menuLabels.community}
					<img
						class="theme-classic-menu__label"
						src={menuLabels.community}
						alt={$_('community')} />
				{:else}
					<span>{$_('community')}</span>
				{/if}
			</span>
			<label
				class="theme-classic-menu__header-hitbox"
				for={`${menuIdPrefix}-community-toggle`}
				aria-label="Toggle Community"></label>
			<label
				class="theme-classic-menu__toggle"
				for={`${menuIdPrefix}-community-toggle`}
				aria-label="Toggle Community"></label>
		</div>
		<div class="theme-classic-menu__submenu" id={`${menuIdPrefix}-community`}>
			{#each communityLinks as link}
				<a
					class:theme-classic-menu__submenu-link--active={isActive(
						link.href,
						$page.url,
					)}
					href={withThemePreview($page.url, link.href)}
					>{serverText(link.label, identity)}</a>
			{/each}
		</div>
	</section>

	<section>
		<input
			class="theme-classic-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-forum-toggle`} />
		<div class="theme-classic-menu__category">
			<span class="theme-classic-menu__category-link">
				{#if menuIcons.forum}
					<img src={menuIcons.forum} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faPeopleArrows} />
				{/if}
				{#if menuLabels.forum}
					<img
						class="theme-classic-menu__label"
						src={menuLabels.forum}
						alt="Forum" />
				{:else}
					<span>Forum</span>
				{/if}
			</span>
			<label
				class="theme-classic-menu__header-hitbox"
				for={`${menuIdPrefix}-forum-toggle`}
				aria-label="Toggle Forum"></label>
			<label
				class="theme-classic-menu__toggle"
				for={`${menuIdPrefix}-forum-toggle`}
				aria-label="Toggle Forum"></label>
		</div>
		<div class="theme-classic-menu__submenu" id={`${menuIdPrefix}-forum`}>
			{#if presentation?.navigation.forum}
				{#each presentation.navigation.forum as link}
					<a href={withThemePreview($page.url, link.href)}
						>{serverText(link.label, identity)}</a>
				{/each}
			{:else}
				<a
					href={withThemePreview($page.url, '/unavailable?feature=guildboards')}
					>Guild Boards</a>
				<a
					href={withThemePreview(
						$page.url,
						'/unavailable?feature=communityboards',
					)}>Community Boards</a>
			{/if}
		</div>
	</section>

	<section>
		<input
			class="theme-classic-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-account-toggle`} />
		<div class="theme-classic-menu__category">
			<span class="theme-classic-menu__category-link">
				{#if menuIcons.account}
					<img src={menuIcons.account} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faUser} />
				{/if}
				{#if menuLabels.account}
					<img
						class="theme-classic-menu__label"
						src={menuLabels.account}
						alt={$_('my-account')} />
				{:else}
					<span>{$_('my-account')}</span>
				{/if}
			</span>
			<label
				class="theme-classic-menu__header-hitbox"
				for={`${menuIdPrefix}-account-toggle`}
				aria-label="Toggle Account"></label>
			<label
				class="theme-classic-menu__toggle"
				for={`${menuIdPrefix}-account-toggle`}
				aria-label="Toggle Account"></label>
		</div>
		<div class="theme-classic-menu__submenu" id={`${menuIdPrefix}-account`}>
			{#if presentation?.navigation.account}
				{#each presentation.navigation.account as link}
					<a href={withThemePreview($page.url, link.href)}
						>{serverText(link.label, identity)}</a>
				{/each}
			{:else}
				<a href={accountHref}>{isLoggedIn ? $_('my-account') : $_('login')}</a>
				{#if !isLoggedIn}
					<a href={accountSignupHref}>{$_('create-account')}</a>
				{/if}
				<a href={accountLostHref}>Lost Account?</a>
			{/if}
		</div>
	</section>

	<section>
		<input
			class="theme-classic-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-character-trade-toggle`} />
		<div class="theme-classic-menu__category">
			<span class="theme-classic-menu__category-link">
				{#if menuIcons.characterTrade}
					<img src={menuIcons.characterTrade} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faGifts} />
				{/if}
				{#if menuLabels.characterTrade}
					<img
						class="theme-classic-menu__label"
						src={menuLabels.characterTrade}
						alt="Char Bazaar" />
				{:else}
					<span class="theme-classic-menu__text-label">Char Bazaar</span>
				{/if}
			</span>
			<label
				class="theme-classic-menu__header-hitbox"
				for={`${menuIdPrefix}-character-trade-toggle`}
				aria-label="Toggle Char Bazaar"></label>
			<label
				class="theme-classic-menu__toggle"
				for={`${menuIdPrefix}-character-trade-toggle`}
				aria-label="Toggle Char Bazaar"></label>
		</div>
		<div
			class="theme-classic-menu__submenu"
			id={`${menuIdPrefix}-character-trade`}>
			{#if presentation?.navigation.characterTrade}
				{#each presentation.navigation.characterTrade as link}
					<a href={withThemePreview($page.url, link.href)}
						>{serverText(link.label, identity)}</a>
				{/each}
			{:else}
				<a
					href={withThemePreview(
						$page.url,
						'/unavailable?feature=currentcharactertrades',
					)}>Current Auctions</a>
				<a
					href={withThemePreview(
						$page.url,
						'/unavailable?feature=pastcharactertrades',
					)}>Auction History</a>
			{/if}
		</div>
	</section>

	<section>
		<input
			class="theme-classic-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-support-toggle`} />
		<div class="theme-classic-menu__category">
			<span class="theme-classic-menu__category-link">
				{#if menuIcons.support}
					<img src={menuIcons.support} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faBookBookmark} />
				{/if}
				{#if menuLabels.support}
					<img
						class="theme-classic-menu__label"
						src={menuLabels.support}
						alt="Support" />
				{:else}
					<span>Support</span>
				{/if}
			</span>
			<label
				class="theme-classic-menu__header-hitbox"
				for={`${menuIdPrefix}-support-toggle`}
				aria-label="Toggle Support"></label>
			<label
				class="theme-classic-menu__toggle"
				for={`${menuIdPrefix}-support-toggle`}
				aria-label="Toggle Support"></label>
		</div>
		<div class="theme-classic-menu__submenu" id={`${menuIdPrefix}-support`}>
			{#if presentation?.navigation.support}
				{#each presentation.navigation.support as link}
					<a href={withThemePreview($page.url, link.href)}
						>{serverText(link.label, identity)}</a>
				{/each}
			{:else}
				<a href={accountLostHref}>Lost Account?</a>
				{#if rulesPage}
					<a href={withThemePreview($page.url, '/pages/rules')}
						>{rulesPage.title}</a>
				{:else}
					<a href={withThemePreview($page.url, '/unavailable?feature=gethelp')}
						>Get Help</a>
				{/if}
			{/if}
		</div>
	</section>
</nav>

<style>
	:global(.theme-classic) .theme-classic-menu {
		display: flex;
		flex-direction: column;
		gap: 5px;
		color: rgb(242 226 195);
		font-family: Verdana, Arial, sans-serif;
	}

	:global(.theme-classic) .theme-classic-menu--main {
		position: relative;
		width: 180px;
		gap: 0;
		transform: translateY(11px);
	}

	:global(.theme-classic) .theme-classic-menu--main::before,
	:global(.theme-classic) .theme-classic-menu--main::after {
		position: absolute;
		left: 1px;
		z-index: 6;
		width: 180px;
		height: 12px;
		background-repeat: repeat-x;
		background-size: auto 12px;
		content: '';
		pointer-events: none;
	}

	:global(.theme-classic) .theme-classic-menu--main::before {
		top: -12px;
		background-image: var(--classic-menu-box-top, none);
	}

	:global(.theme-classic) .theme-classic-menu--main::after {
		bottom: -12px;
		background-image: var(--classic-menu-box-bottom, none);
	}

	:global(.theme-classic) .theme-classic-menu section {
		position: relative;
		border: 0;
		background: transparent;
		box-shadow: none;
	}

	:global(.theme-classic) .theme-classic-menu__account {
		padding: 8px 8px 10px;
		border-color: rgb(75 69 60);
		background:
			linear-gradient(rgb(37 35 31 / 0.92), rgb(22 21 19 / 0.96)), rgb(22 21 19);
	}

	:global(.theme-classic) .theme-classic-menu__account form {
		margin: 5px 0;
	}

	:global(.theme-classic) .theme-classic-menu__action,
	:global(.theme-classic) .theme-classic-menu__link-action {
		display: flex;
		width: 100%;
		min-height: 32px;
		align-items: center;
		justify-content: center;
		gap: 5px;
		border: 0;
		background: var(
				--classic-menu-button,
				linear-gradient(180deg, rgb(21 42 207), rgb(14 8 137))
			)
			center / 100% 100% no-repeat;
		color: rgb(255 223 61);
		cursor: pointer;
		font-size: 16px;
		font-weight: 700;
		line-height: 1;
		text-align: center;
		text-decoration: none;
		text-shadow:
			1px 1px 0 rgb(0 0 0),
			-1px -1px 0 rgb(0 0 0);
	}

	:global(.theme-classic) .theme-classic-menu__link-action {
		min-height: 26px;
		background:
			linear-gradient(rgb(43 34 30 / 0.86), rgb(33 24 21 / 0.92)), rgb(38 27 23);
		color: rgb(233 213 181);
		font-size: 12px;
		font-weight: 400;
		text-shadow: none;
	}

	:global(.theme-classic) .theme-classic-menu__action:hover,
	:global(.theme-classic) .theme-classic-menu__action:focus {
		background: var(
				--classic-menu-button-hover,
				linear-gradient(180deg, rgb(36 73 255), rgb(15 8 160))
			)
			center / 100% 100% no-repeat;
		color: white;
	}

	:global(.theme-classic) .theme-classic-menu h2,
	:global(.theme-classic) .theme-classic-menu__category {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 2px;
		margin: 0;
		padding: 0 17px 0 14px;
		border: 0;
		background: var(
				--classic-menu-button,
				linear-gradient(90deg, rgb(67 22 14), rgb(137 31 20), rgb(50 19 15))
			)
			6px 0 / 170px 32px no-repeat;
		box-shadow: none;
		color: rgb(239 222 186);
		font-size: 13px;
		font-weight: 700;
		line-height: 1.1;
		text-decoration: none;
	}

	:global(.theme-classic) .theme-classic-menu h2 {
		min-height: 32px;
	}

	:global(.theme-classic) .theme-classic-menu__category {
		min-height: 32px;
		gap: 0;
	}

	:global(.theme-classic) .theme-classic-menu__category-link {
		display: flex;
		min-width: 0;
		flex: 1 1 auto;
		align-items: center;
		gap: 2px;
		color: inherit;
		text-decoration: none;
	}

	:global(.theme-classic) .theme-classic-menu h2::before,
	:global(.theme-classic) .theme-classic-menu h2::after,
	:global(.theme-classic) .theme-classic-menu__category::before,
	:global(.theme-classic) .theme-classic-menu__category::after {
		position: absolute;
		display: none;
		width: 8px;
		height: 32px;
		top: 0;
		background: var(--classic-green-light, none) center / 8px 32px no-repeat;
		content: '';
		pointer-events: none;
	}

	:global(.theme-classic) .theme-classic-menu h2::before {
		left: -5px;
	}

	:global(.theme-classic) .theme-classic-menu h2::after,
	:global(.theme-classic) .theme-classic-menu__category::after {
		right: -5px;
		transform: scaleX(-1);
	}

	:global(.theme-classic) .theme-classic-menu__category::before {
		left: -5px;
	}

	:global(.theme-classic) .theme-classic-menu__category:hover,
	:global(.theme-classic) .theme-classic-menu__category:focus-within {
		background-image: var(
			--classic-menu-button-hover,
			var(--classic-menu-button)
		);
		filter: none;
	}

	:global(.theme-classic) .theme-classic-menu__text-label {
		font-family: ClassicHeadline, Georgia, serif;
		font-size: 17px;
		font-weight: 400;
		letter-spacing: 0;
		text-shadow:
			1px 1px 0 rgb(0 0 0),
			0 0 4px rgb(0 0 0 / 0.72);
	}
	:global(.theme-classic) .theme-classic-menu__server-label {
		min-width: 0;
		width: 116px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 14px;
	}

	:global(.theme-classic)
		.theme-classic-menu
		h2
		> img:not(.theme-classic-menu__label),
	:global(.theme-classic)
		.theme-classic-menu__category-link
		> img:not(.theme-classic-menu__label) {
		width: 32px;
		height: 32px;
		flex: 0 0 32px;
		object-fit: contain;
	}

	:global(.theme-classic) .theme-classic-menu__label {
		width: 116px;
		height: 22px;
		object-fit: contain;
		transform: translateY(1px);
	}

	:global(.theme-classic) .theme-classic-menu__toggle-input {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: 0;
		opacity: 0;
		pointer-events: none;
	}

	:global(.theme-classic)
		.theme-classic-menu__toggle-input:not(:checked)
		+ h2
		+ .theme-classic-menu__submenu,
	:global(.theme-classic)
		.theme-classic-menu__toggle-input:not(:checked)
		+ .theme-classic-menu__category
		+ .theme-classic-menu__submenu {
		display: none;
	}

	:global(.theme-classic) .theme-classic-menu__header-hitbox {
		position: absolute;
		inset: 0;
		z-index: 5;
		display: block;
		cursor: pointer;
	}

	:global(.theme-classic) .theme-classic-menu__submenu {
		position: relative;
		z-index: 2;
		overflow: hidden;
	}

	:global(.theme-classic) .theme-classic-menu__submenu::before,
	:global(.theme-classic) .theme-classic-menu__submenu::after {
		display: none;
	}

	:global(.theme-classic) .theme-classic-menu__submenu::before {
		left: 6px;
	}

	:global(.theme-classic) .theme-classic-menu__submenu::after {
		right: 5px;
	}

	:global(.theme-classic) .theme-classic-menu__toggle {
		position: absolute;
		top: 20px;
		right: 2px;
		z-index: 7;
		display: block;
		width: 12px;
		height: 12px;
		padding: 0;
		border: 0;
		background-color: transparent;
		background: var(--classic-expand-plus, none) center / 12px 12px no-repeat;
		cursor: pointer;
		font-size: 0;
		image-rendering: pixelated;
	}

	:global(.theme-classic)
		.theme-classic-menu__toggle-input:checked
		+ h2
		.theme-classic-menu__toggle,
	:global(.theme-classic)
		.theme-classic-menu__toggle-input:checked
		+ .theme-classic-menu__category
		.theme-classic-menu__toggle {
		background-image: var(
			--classic-expand-minus,
			var(--classic-expand-plus, none)
		);
	}

	:global(.theme-classic) .theme-classic-menu__submenu > a {
		position: relative;
		display: block;
		box-sizing: border-box;
		height: 21px;
		min-height: 0;
		margin: 0 9px 0 11px;
		padding: 2px 0 2px 15px;
		background: rgb(13 46 43);
		box-shadow: inset 0 -1px 0 rgb(76 119 116);
		color: rgb(215 215 215);
		font-family: Arial, sans-serif;
		font-size: 13.3333px;
		font-weight: 700;
		line-height: 16px;
		text-decoration: none;
		text-shadow: 1px 1px 0 rgb(0 0 0);
	}

	:global(.theme-classic) .theme-classic-menu__submenu > a::before {
		position: absolute;
		top: 0;
		left: -5px;
		z-index: 2;
		width: 18px;
		height: 33px;
		background: var(--classic-menu-chain, none) left top / 7px 10px repeat-y;
		content: '';
		pointer-events: none;
	}

	:global(.theme-classic) .theme-classic-menu__submenu > a::after {
		position: absolute;
		top: 0;
		right: -4px;
		z-index: 2;
		width: 7px;
		height: 33px;
		background: var(--classic-menu-chain, none) left top / 7px 10px repeat-y;
		content: '';
		pointer-events: none;
	}

	:global(.theme-classic)
		.theme-classic-menu__submenu
		> a.theme-classic-menu__submenu-link--active::before {
		background:
			var(--classic-menu-chain, none) left top / 7px 10px repeat-y,
			var(--classic-active-submenu, none) 8px 5px / 10px 10px no-repeat;
	}

	:global(.theme-classic) .theme-classic-menu__submenu > a:hover,
	:global(.theme-classic) .theme-classic-menu__submenu > a:focus {
		background: rgb(48 58 42 / 0.88);
		color: white;
	}

	:global(.theme-classic)
		.theme-classic-menu__submenu
		> a.theme-classic-menu__submenu-link--active {
		color: rgb(255 255 255);
	}
</style>
