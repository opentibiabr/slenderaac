export type CipLayout = 'news' | 'compact' | 'compact-wide';

const routeLayouts: Record<string, CipLayout> = {
	'/unavailable': 'compact',
	'/download': 'compact',
	'/news/archive': 'compact',
	'/news/event-schedule': 'compact-wide',
};

export function cipLayoutForPath(pathname: string): CipLayout {
	if (cipNativePage(pathname)) return 'compact';
	if (informationPageForPath(pathname)) return 'compact';
	return routeLayouts[pathname.replace(/\/$/, '') || '/'] ?? 'news';
}
import { informationPageForPath } from '$lib/information';

import { cipNativePage } from './native-pages';
