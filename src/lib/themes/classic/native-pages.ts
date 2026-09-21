import { informationPageForPath } from '$lib/information';
import { featurePages } from '$lib/site-pages';

export type NativePage = {
	headline: string;
	headlineWidth?: number;
	headlineHeight?: number;
	auxiliaryThemeboxes?: boolean;
	paperMinHeight: number;
};

export function classicNativePage(pathname: string): NativePage | null {
	pathname = pathname.replace(/\/$/, '') || '/';
	if (
		['/', '/news/archive', '/news/event-schedule'].includes(pathname) ||
		informationPageForPath(pathname)
	)
		return null;
	if (pathname === '/account' || pathname.startsWith('/account/'))
		return {
			headline:
				pathname === '/account/signup'
					? 'headlineCreateAccount'
					: pathname === '/account/lost'
						? 'headlineLostAccount'
						: 'headlineAccountManagement',
			auxiliaryThemeboxes: true,
			paperMinHeight: 387,
		};
	if (pathname === '/shop' || pathname.startsWith('/shop/'))
		return {
			headline: 'headlineWebshop',
			headlineWidth: 192,
			headlineHeight: 32,
			paperMinHeight: 387,
		};
	if (
		pathname.startsWith('/pages/') ||
		pathname === '/download' ||
		pathname === '/unavailable'
	)
		return { headline: '', paperMinHeight: 387 };
	if (pathname === '/guilds' || pathname.startsWith('/guilds/'))
		return { headline: 'headlineGuilds', paperMinHeight: 387 };
	if (pathname === '/characters' || pathname.startsWith('/characters/'))
		return { headline: 'headlineCharacters', paperMinHeight: 387 };
	if (pathname === '/highscores')
		return { headline: 'headlineHighscores', paperMinHeight: 387 };
	if (pathname === '/online')
		return {
			headline: 'headlineWorlds',
			headlineWidth: 192,
			headlineHeight: 32,
			paperMinHeight: 387,
		};
	const feature = Object.values(featurePages).find(
		(page) => page.path === pathname,
	);
	return {
		headline: feature?.headline ?? '',
		headlineWidth: feature?.headlineWidth,
		headlineHeight: feature?.headlineHeight,
		paperMinHeight: 387,
	};
}
