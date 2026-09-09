export type NativePage = { headline: string; paperMinHeight: number };

export function cipNativePage(pathname: string): NativePage | null {
	if (pathname === '/characters' || pathname.startsWith('/characters/'))
		return { headline: 'headlineCharacters', paperMinHeight: 387 };
	return null;
}
