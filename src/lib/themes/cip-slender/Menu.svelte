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

	import Button from '$lib/components/ui/Button.svelte';

	import { PUBLIC_DOWNLOAD_URL } from '$env/static/public';

	type StaticPage = {
		title: string;
		slug: string;
	};

	export let isLoggedIn = false;
	export let staticPages: StaticPage[] = [];
</script>

<nav class="theme-cip-slender-menu" aria-label="Main navigation">
	<section class="theme-cip-slender-menu__account">
		{#if isLoggedIn}
			<Button href="/account" class="theme-cip-slender-menu__button">
				<Fa icon={faUser} />
				{$_('my-account')}
			</Button>
			<form action="/account/logout" method="post">
				<Button
					type="submit"
					variant="soft"
					color="secondary"
					class="theme-cip-slender-menu__button">
					<Fa icon={faRightFromBracket} />
					{$_('logout')}
				</Button>
			</form>
		{:else}
			<Button href="/account/login" class="theme-cip-slender-menu__button">
				<Fa icon={faRightToBracket} />
				{$_('login')}
			</Button>
			<Button
				href="/account/signup"
				variant="soft"
				color="secondary"
				class="theme-cip-slender-menu__button">
				<Fa icon={faUserPlus} />
				{$_('create-account')}
			</Button>
		{/if}
		<Button href={PUBLIC_DOWNLOAD_URL} class="theme-cip-slender-menu__button">
			<Fa icon={faDownload} />
			{$_('download')}
		</Button>
	</section>

	<section>
		<h2><Fa icon={faNewspaper} /> {$_('news')}</h2>
		<a href="/">{$_('latest-news')}</a>
	</section>

	<section>
		<h2><Fa icon={faPeopleArrows} /> {$_('community')}</h2>
		<a href="/characters">{$_('characters')}</a>
		<a href="/online">{$_('whos-online')}</a>
		<a href="/highscores">{$_('highscores')}</a>
		<a href="/guilds">{$_('guilds.title')}</a>
	</section>

	<section>
		<h2><Fa icon={faBookBookmark} /> {$_('library')}</h2>
		{#each staticPages as page}
			<a href={`/pages/${page.slug}`}>{page.title}</a>
		{/each}
	</section>

	<section>
		<h2><Fa icon={faGifts} /> {$_('shop.title')}</h2>
		<a href="/shop">{$_('buy-coins')}</a>
	</section>
</nav>

<style>
	:global(.theme-cip-slender) .theme-cip-slender-menu {
		display: flex;
		flex-direction: column;
		gap: 10px;
		color: rgb(242 226 195);
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu section {
		border: 1px solid rgb(80 58 38);
		background: rgb(31 25 20 / 0.94);
		box-shadow: inset 0 0 0 1px rgb(255 232 185 / 0.06);
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__account {
		padding: 8px;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu__account form {
		margin: 6px 0;
	}

	:global(.theme-cip-slender .theme-cip-slender-menu__button) {
		width: 100%;
		justify-content: center;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu h2 {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
		padding: 7px 10px;
		border-bottom: 1px solid rgb(80 58 38);
		background: linear-gradient(180deg, rgb(94 36 22), rgb(53 28 20));
		font-size: 13px;
		font-weight: 700;
		line-height: 1.2;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu a {
		display: block;
		padding: 7px 12px;
		border-bottom: 1px solid rgb(80 58 38 / 0.65);
		color: rgb(242 226 195);
		font-size: 13px;
		text-decoration: none;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu a:hover,
	:global(.theme-cip-slender) .theme-cip-slender-menu a:focus {
		background: rgb(99 59 30);
		color: white;
	}

	:global(.theme-cip-slender) .theme-cip-slender-menu a:last-child {
		border-bottom: 0;
	}
</style>
