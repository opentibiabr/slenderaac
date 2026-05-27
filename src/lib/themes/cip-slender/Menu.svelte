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

	import { PUBLIC_DOWNLOAD_URL } from '$env/static/public';

	import { cipAsset } from './theme';

	type StaticPage = {
		title: string;
		slug: string;
	};

	export let isLoggedIn = false;
	export let staticPages: StaticPage[] = [];
	export let assets: Record<string, string | undefined> | null | undefined = {};
	export let showAccountActions = true;

	$: menuIdPrefix = showAccountActions ? 'cip-menu-drawer' : 'cip-menu-main';
	$: firstStaticPageHref =
		staticPages.length > 0 ? `/pages/${staticPages[0].slug}` : '/pages/rules';
	$: accountHref = isLoggedIn ? '/account' : '/account/login';

	$: menuButtonBackground = cipAsset(assets, 'menuButtonBackground');
	$: menuButtonHover = cipAsset(assets, 'menuButtonHover');
	$: menuStyle = [
		menuButtonBackground
			? `--cip-menu-button: url("${menuButtonBackground}")`
			: '',
		menuButtonHover ? `--cip-menu-button-hover: url("${menuButtonHover}")` : '',
	]
		.filter(Boolean)
		.join('; ');

	$: menuIcons = {
		news: cipAsset(assets, 'menuIconNews'),
		community: cipAsset(assets, 'menuIconCommunity'),
		library: cipAsset(assets, 'menuIconLibrary'),
		shop: cipAsset(assets, 'menuIconShop'),
		about: cipAsset(assets, 'menuIconAbout'),
		guides: cipAsset(assets, 'menuIconGameGuides'),
		characterTrade: cipAsset(assets, 'menuIconCharacterTrade'),
		account: cipAsset(assets, 'menuIconAccount'),
		forum: cipAsset(assets, 'menuIconForum'),
		support: cipAsset(assets, 'menuIconSupport'),
	};

	$: activeSubmenuIcon = cipAsset(assets, 'menuIconActiveSubmenu');
	$: expandPlus = cipAsset(assets, 'menuExpandPlus');
	$: expandMinus = cipAsset(assets, 'menuExpandMinus');
	$: greenLight = cipAsset(assets, 'menuGreenLight');
	$: boxTop = cipAsset(assets, 'boxTop');
	$: boxBottom = cipAsset(assets, 'boxBottom');
	$: chain = cipAsset(assets, 'chain');

	$: menuLabels = {
		news: cipAsset(assets, 'menuLabelNews'),
		community: cipAsset(assets, 'menuLabelCommunity'),
		library: cipAsset(assets, 'menuLabelLibrary'),
		shop: cipAsset(assets, 'menuLabelShop'),
		about: cipAsset(assets, 'menuLabelAbout'),
		guides: cipAsset(assets, 'menuLabelGameGuides'),
		characterTrade: cipAsset(assets, 'menuLabelCharacterTrade'),
		account: cipAsset(assets, 'menuLabelAccount'),
		forum: cipAsset(assets, 'menuLabelForum'),
		support: cipAsset(assets, 'menuLabelSupport'),
	};

	$: menuChromeStyle = [
		menuStyle,
		activeSubmenuIcon
			? `--cip-active-submenu: url("${activeSubmenuIcon}")`
			: '',
		expandPlus ? `--cip-expand-plus: url("${expandPlus}")` : '',
		expandMinus ? `--cip-expand-minus: url("${expandMinus}")` : '',
		greenLight ? `--cip-green-light: url("${greenLight}")` : '',
		boxTop ? `--cip-menu-box-top: url("${boxTop}")` : '',
		boxBottom ? `--cip-menu-box-bottom: url("${boxBottom}")` : '',
		chain ? `--cip-menu-chain: url("${chain}")` : '',
	]
		.filter(Boolean)
		.join('; ');
</script>

<nav
	class={`theme-cip-slender-menu${
		!showAccountActions ? ' theme-cip-slender-menu--main' : ''
	}`}
	aria-label="Main navigation"
	style={menuChromeStyle}>
	{#if showAccountActions}
		<section class="theme-cip-slender-menu__account">
			{#if isLoggedIn}
				<a class="theme-cip-slender-menu__action" href="/account">
					<Fa icon={faUser} />
					{$_('my-account')}
				</a>
				<form action="/account/logout" method="post">
					<button class="theme-cip-slender-menu__action" type="submit">
						<Fa icon={faRightFromBracket} />
						{$_('logout')}
					</button>
				</form>
			{:else}
				<a class="theme-cip-slender-menu__action" href="/account/login">
					<Fa icon={faRightToBracket} />
					{$_('login')}
				</a>
				<a class="theme-cip-slender-menu__link-action" href="/account/signup">
					<Fa icon={faUserPlus} />
					{$_('create-account')}
				</a>
			{/if}
			<a class="theme-cip-slender-menu__action" href={PUBLIC_DOWNLOAD_URL}>
				<Fa icon={faDownload} />
				{$_('download')}
			</a>
		</section>
	{/if}

	<section>
		<input
			class="theme-cip-slender-menu__toggle-input"
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
					class="theme-cip-slender-menu__label"
					src={menuLabels.news}
					alt={$_('news')} />
			{:else}
				<span>{$_('news')}</span>
			{/if}
			<label
				class="theme-cip-slender-menu__header-hitbox"
				for={`${menuIdPrefix}-news-toggle`}
				aria-label="Toggle News"></label>
			<label
				class="theme-cip-slender-menu__toggle"
				for={`${menuIdPrefix}-news-toggle`}
				aria-label="Toggle News"></label>
		</h2>
		<div class="theme-cip-slender-menu__submenu" id={`${menuIdPrefix}-news`}>
			<a class="theme-cip-slender-menu__submenu-link--active" href="/"
				>Latest News</a>
			<a href="/">News Archive</a>
			<a href="/">Event Schedule</a>
		</div>
	</section>

	<section>
		<input
			class="theme-cip-slender-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-about-toggle`} />
		<div class="theme-cip-slender-menu__category">
			<a class="theme-cip-slender-menu__category-link" href="/characters">
				{#if menuIcons.about}
					<img src={menuIcons.about} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faBookBookmark} />
				{/if}
				{#if menuLabels.about}
					<img
						class="theme-cip-slender-menu__label"
						src={menuLabels.about}
						alt="About Tibia" />
				{:else}
					<span class="theme-cip-slender-menu__text-label">About Tibia</span>
				{/if}
			</a>
			<label
				class="theme-cip-slender-menu__header-hitbox"
				for={`${menuIdPrefix}-about-toggle`}
				aria-label="Toggle About Tibia"></label>
			<label
				class="theme-cip-slender-menu__toggle"
				for={`${menuIdPrefix}-about-toggle`}
				aria-label="Toggle About Tibia"></label>
		</div>
		<div class="theme-cip-slender-menu__submenu" id={`${menuIdPrefix}-about`}>
			<a href="/characters">What Is Tibia?</a>
			<a href="/">Screenshots</a>
			<a href="/">Game Features</a>
			<a href="/shop">Premium Features</a>
			<a href="/">About CipSoft</a>
		</div>
	</section>

	<section>
		<input
			class="theme-cip-slender-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-guides-toggle`} />
		<div class="theme-cip-slender-menu__category">
			<a class="theme-cip-slender-menu__category-link" href="/pages/rules">
				{#if menuIcons.guides}
					<img src={menuIcons.guides} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faBookBookmark} />
				{/if}
				{#if menuLabels.guides}
					<img
						class="theme-cip-slender-menu__label"
						src={menuLabels.guides}
						alt="Game Guides" />
				{:else}
					<span class="theme-cip-slender-menu__text-label">Game Guides</span>
				{/if}
			</a>
			<label
				class="theme-cip-slender-menu__header-hitbox"
				for={`${menuIdPrefix}-guides-toggle`}
				aria-label="Toggle Game Guides"></label>
			<label
				class="theme-cip-slender-menu__toggle"
				for={`${menuIdPrefix}-guides-toggle`}
				aria-label="Toggle Game Guides"></label>
		</div>
		<div class="theme-cip-slender-menu__submenu" id={`${menuIdPrefix}-guides`}>
			<a href="/pages/rules">Quickstart</a>
			<a href="/pages/rules">Manual</a>
			<a href="/pages/rules">Security Hints</a>
		</div>
	</section>

	<section>
		<input
			class="theme-cip-slender-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-library-toggle`} />
		<div class="theme-cip-slender-menu__category">
			<a class="theme-cip-slender-menu__category-link" href={firstStaticPageHref}>
				{#if menuIcons.library}
					<img src={menuIcons.library} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faBookBookmark} />
				{/if}
				{#if menuLabels.library}
					<img
						class="theme-cip-slender-menu__label"
						src={menuLabels.library}
						alt={$_('library')} />
				{:else}
					<span>{$_('library')}</span>
				{/if}
			</a>
			<label
				class="theme-cip-slender-menu__header-hitbox"
				for={`${menuIdPrefix}-library-toggle`}
				aria-label="Toggle Library"></label>
			<label
				class="theme-cip-slender-menu__toggle"
				for={`${menuIdPrefix}-library-toggle`}
				aria-label="Toggle Library"></label>
		</div>
		<div class="theme-cip-slender-menu__submenu" id={`${menuIdPrefix}-library`}>
			<a href={firstStaticPageHref}>Rules</a>
			<a href={firstStaticPageHref}>Server Info</a>
		</div>
	</section>

	<section>
		<input
			class="theme-cip-slender-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-community-toggle`} />
		<div class="theme-cip-slender-menu__category">
			<a class="theme-cip-slender-menu__category-link" href="/characters">
				{#if menuIcons.community}
					<img src={menuIcons.community} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faPeopleArrows} />
				{/if}
				{#if menuLabels.community}
					<img
						class="theme-cip-slender-menu__label"
						src={menuLabels.community}
						alt={$_('community')} />
				{:else}
					<span>{$_('community')}</span>
				{/if}
			</a>
			<label
				class="theme-cip-slender-menu__header-hitbox"
				for={`${menuIdPrefix}-community-toggle`}
				aria-label="Toggle Community"></label>
			<label
				class="theme-cip-slender-menu__toggle"
				for={`${menuIdPrefix}-community-toggle`}
				aria-label="Toggle Community"></label>
		</div>
		<div class="theme-cip-slender-menu__submenu" id={`${menuIdPrefix}-community`}>
			<a href="/characters">Characters</a>
			<a href="/online">Who Is Online?</a>
			<a href="/highscores">Highscores</a>
			<a href="/guilds">Guilds</a>
		</div>
	</section>

	<section>
		<input
			class="theme-cip-slender-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-forum-toggle`} />
		<div class="theme-cip-slender-menu__category">
			<a class="theme-cip-slender-menu__category-link" href="/guilds">
				{#if menuIcons.forum}
					<img src={menuIcons.forum} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faPeopleArrows} />
				{/if}
				{#if menuLabels.forum}
					<img
						class="theme-cip-slender-menu__label"
						src={menuLabels.forum}
						alt="Forum" />
				{:else}
					<span>Forum</span>
				{/if}
			</a>
			<label
				class="theme-cip-slender-menu__header-hitbox"
				for={`${menuIdPrefix}-forum-toggle`}
				aria-label="Toggle Forum"></label>
			<label
				class="theme-cip-slender-menu__toggle"
				for={`${menuIdPrefix}-forum-toggle`}
				aria-label="Toggle Forum"></label>
		</div>
		<div class="theme-cip-slender-menu__submenu" id={`${menuIdPrefix}-forum`}>
			<a href="/guilds">Guild Boards</a>
			<a href="/characters">Character Discussions</a>
		</div>
	</section>

	<section>
		<input
			class="theme-cip-slender-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-account-toggle`} />
		<div class="theme-cip-slender-menu__category">
			<a class="theme-cip-slender-menu__category-link" href={accountHref}>
				{#if menuIcons.account}
					<img src={menuIcons.account} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faUser} />
				{/if}
				{#if menuLabels.account}
					<img
						class="theme-cip-slender-menu__label"
						src={menuLabels.account}
						alt={$_('my-account')} />
				{:else}
					<span>{$_('my-account')}</span>
				{/if}
			</a>
			<label
				class="theme-cip-slender-menu__header-hitbox"
				for={`${menuIdPrefix}-account-toggle`}
				aria-label="Toggle Account"></label>
			<label
				class="theme-cip-slender-menu__toggle"
				for={`${menuIdPrefix}-account-toggle`}
				aria-label="Toggle Account"></label>
		</div>
		<div class="theme-cip-slender-menu__submenu" id={`${menuIdPrefix}-account`}>
			<a href={accountHref}>{isLoggedIn ? $_('my-account') : $_('login')}</a>
			{#if !isLoggedIn}
				<a href="/account/signup">{$_('create-account')}</a>
			{/if}
			<a href="/account/lost">Lost Account?</a>
		</div>
	</section>

	<section>
		<input
			class="theme-cip-slender-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-character-trade-toggle`} />
		<div class="theme-cip-slender-menu__category">
			<a class="theme-cip-slender-menu__category-link" href="/characters">
				{#if menuIcons.characterTrade}
					<img src={menuIcons.characterTrade} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faGifts} />
				{/if}
				{#if menuLabels.characterTrade}
					<img
						class="theme-cip-slender-menu__label"
						src={menuLabels.characterTrade}
						alt="Char Bazaar" />
				{:else}
					<span class="theme-cip-slender-menu__text-label">Char Bazaar</span>
				{/if}
			</a>
			<label
				class="theme-cip-slender-menu__header-hitbox"
				for={`${menuIdPrefix}-character-trade-toggle`}
				aria-label="Toggle Char Bazaar"></label>
			<label
				class="theme-cip-slender-menu__toggle"
				for={`${menuIdPrefix}-character-trade-toggle`}
				aria-label="Toggle Char Bazaar"></label>
		</div>
		<div
			class="theme-cip-slender-menu__submenu"
			id={`${menuIdPrefix}-character-trade`}>
			<a href="/characters">Current Auctions</a>
			<a href="/characters">Create Auction</a>
		</div>
	</section>

	<section>
		<input
			class="theme-cip-slender-menu__toggle-input"
			type="checkbox"
			id={`${menuIdPrefix}-support-toggle`} />
		<div class="theme-cip-slender-menu__category">
			<a class="theme-cip-slender-menu__category-link" href="/account/lost">
				{#if menuIcons.support}
					<img src={menuIcons.support} alt="" aria-hidden="true" />
				{:else}
					<Fa icon={faBookBookmark} />
				{/if}
				{#if menuLabels.support}
					<img
						class="theme-cip-slender-menu__label"
						src={menuLabels.support}
						alt="Support" />
				{:else}
					<span>Support</span>
				{/if}
			</a>
			<label
				class="theme-cip-slender-menu__header-hitbox"
				for={`${menuIdPrefix}-support-toggle`}
				aria-label="Toggle Support"></label>
			<label
				class="theme-cip-slender-menu__toggle"
				for={`${menuIdPrefix}-support-toggle`}
				aria-label="Toggle Support"></label>
		</div>
		<div class="theme-cip-slender-menu__submenu" id={`${menuIdPrefix}-support`}>
			<a href="/account/lost">Lost Account?</a>
			<a href={firstStaticPageHref}>Rules</a>
		</div>
	</section>
</nav>

<style>
	:global(.theme-cip-slender) .theme-cip-slender-menu {
		display: flex;
		flex-direction: column;
		gap: 5px;
		color: rgb(242 226 195);
		font-family: Verdana, Arial, sans-serif;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu--main {
		position: relative;
		width: 180px;
		gap: 0;
		transform: translateY(11px);
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu--main::before,
	:global(.theme-cip-slender) .theme-cip-slender-menu--main::after {
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

	:global(.theme-cip-slender) .theme-cip-slender-menu--main::before {
		top: -12px;
		background-image: var(--cip-menu-box-top, none);
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu--main::after {
		bottom: -12px;
		background-image: var(--cip-menu-box-bottom, none);
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu section {
		position: relative;
		border: 0;
		background: transparent;
		box-shadow: none;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__account {
		padding: 8px 8px 10px;
		border-color: rgb(75 69 60);
		background:
			linear-gradient(rgb(37 35 31 / 0.92), rgb(22 21 19 / 0.96)), rgb(22 21 19);
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__account form {
		margin: 5px 0;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__action,
	:global(.theme-cip-slender) .theme-cip-slender-menu__link-action {
		display: flex;
		width: 100%;
		min-height: 32px;
		align-items: center;
		justify-content: center;
		gap: 5px;
		border: 0;
		background: var(
				--cip-menu-button,
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

	:global(.theme-cip-slender) .theme-cip-slender-menu__link-action {
		min-height: 26px;
		background:
			linear-gradient(rgb(43 34 30 / 0.86), rgb(33 24 21 / 0.92)), rgb(38 27 23);
		color: rgb(233 213 181);
		font-size: 12px;
		font-weight: 400;
		text-shadow: none;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__action:hover,
	:global(.theme-cip-slender) .theme-cip-slender-menu__action:focus {
		background: var(
				--cip-menu-button-hover,
				linear-gradient(180deg, rgb(36 73 255), rgb(15 8 160))
			)
			center / 100% 100% no-repeat;
		color: white;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu h2,
	:global(.theme-cip-slender) .theme-cip-slender-menu__category {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 2px;
		margin: 0;
		padding: 0 17px 0 14px;
		border: 0;
		background: var(
				--cip-menu-button,
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

	:global(.theme-cip-slender) .theme-cip-slender-menu h2 {
		min-height: 32px;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__category {
		min-height: 32px;
		gap: 0;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__category-link {
		display: flex;
		min-width: 0;
		flex: 1 1 auto;
		align-items: center;
		gap: 2px;
		color: inherit;
		text-decoration: none;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu h2::before,
	:global(.theme-cip-slender) .theme-cip-slender-menu h2::after,
	:global(.theme-cip-slender) .theme-cip-slender-menu__category::before,
	:global(.theme-cip-slender) .theme-cip-slender-menu__category::after {
		position: absolute;
		display: none;
		width: 8px;
		height: 32px;
		top: 0;
		background: var(--cip-green-light, none) center / 8px 32px no-repeat;
		content: '';
		pointer-events: none;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu h2::before {
		left: -5px;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu h2::after,
	:global(.theme-cip-slender) .theme-cip-slender-menu__category::after {
		right: -5px;
		transform: scaleX(-1);
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__category::before {
		left: -5px;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__category:hover,
	:global(.theme-cip-slender)
		.theme-cip-slender-menu__category:focus-within {
		background-image: var(--cip-menu-button-hover, var(--cip-menu-button));
		filter: none;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__text-label {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 17px;
		font-weight: 800;
		letter-spacing: 0;
		text-shadow:
			1px 1px 0 rgb(0 0 0),
			0 0 4px rgb(0 0 0 / 0.72);
	}

	:global(.theme-cip-slender)
		.theme-cip-slender-menu
		h2
		> img:not(.theme-cip-slender-menu__label),
	:global(.theme-cip-slender)
		.theme-cip-slender-menu__category-link
		> img:not(.theme-cip-slender-menu__label) {
		width: 32px;
		height: 32px;
		flex: 0 0 32px;
		object-fit: contain;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__label {
		width: 116px;
		height: 22px;
		object-fit: contain;
		transform: translateY(1px);
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__toggle-input {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: 0;
		opacity: 0;
		pointer-events: none;
	}

	:global(.theme-cip-slender)
		.theme-cip-slender-menu__toggle-input:not(:checked)
		+ h2
		+ .theme-cip-slender-menu__submenu,
	:global(.theme-cip-slender)
		.theme-cip-slender-menu__toggle-input:not(:checked)
		+ .theme-cip-slender-menu__category
		+ .theme-cip-slender-menu__submenu {
		display: none;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__header-hitbox {
		position: absolute;
		inset: 0;
		z-index: 5;
		display: block;
		cursor: pointer;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__submenu {
		position: relative;
		z-index: 2;
		overflow: hidden;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__submenu::before,
	:global(.theme-cip-slender) .theme-cip-slender-menu__submenu::after {
		display: none;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__submenu::before {
		left: 6px;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__submenu::after {
		right: 5px;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__toggle {
		position: absolute;
		top: 20px;
		right: 2.5px;
		z-index: 7;
		display: block;
		width: 12px;
		height: 12px;
		padding: 0;
		border: 0;
		background-color: transparent;
		background: var(--cip-expand-plus, none) center / contain no-repeat;
		cursor: pointer;
		font-size: 0;
	}

	:global(.theme-cip-slender)
		.theme-cip-slender-menu__toggle-input:checked
		+ h2
		.theme-cip-slender-menu__toggle,
	:global(.theme-cip-slender)
		.theme-cip-slender-menu__toggle-input:checked
		+ .theme-cip-slender-menu__category
		.theme-cip-slender-menu__toggle {
		background-image: var(--cip-expand-minus, var(--cip-expand-plus, none));
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__submenu > a {
		position: relative;
		display: block;
		box-sizing: border-box;
		height: 21px;
		min-height: 0;
		margin: 0 9.5px 0 10.5px;
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

	:global(.theme-cip-slender) .theme-cip-slender-menu__submenu > a::before {
		position: absolute;
		top: 0;
		left: -5px;
		z-index: 2;
		width: 18px;
		height: 33px;
		background: var(--cip-menu-chain, none) left top / 7px 10px repeat-y;
		content: '';
		pointer-events: none;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__submenu > a::after {
		position: absolute;
		top: 0;
		right: -4px;
		z-index: 2;
		width: 7px;
		height: 33px;
		background: var(--cip-menu-chain, none) left top / 7px 10px repeat-y;
		content: '';
		pointer-events: none;
	}

	:global(.theme-cip-slender)
		.theme-cip-slender-menu__submenu
		> a.theme-cip-slender-menu__submenu-link--active::before {
		background:
			var(--cip-menu-chain, none) left top / 7px 10px repeat-y,
			var(--cip-active-submenu, none) 8px 5px / 10px 10px no-repeat;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__submenu > a:hover,
	:global(.theme-cip-slender) .theme-cip-slender-menu__submenu > a:focus {
		background: rgb(48 58 42 / 0.88);
		color: white;
	}

	:global(.theme-cip-slender)
		.theme-cip-slender-menu__submenu
		> a.theme-cip-slender-menu__submenu-link--active {
		color: rgb(255 255 255);
	}
</style>
