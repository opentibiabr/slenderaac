export type NativePage = {
	headline: string;
	headlineWidth?: number;
	headlineHeight?: number;
	paperMinHeight: number;
};

export function cipNativePage(pathname: string): NativePage | null {
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
	return null;
}
