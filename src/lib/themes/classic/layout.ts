export type ClassicLayout = 'news' | 'compact' | 'compact-wide';

const routeLayouts: Record<string, ClassicLayout> = {
	'/unavailable': 'compact',
	'/download': 'compact',
	'/news/archive': 'compact',
	'/news/event-schedule': 'compact-wide',
};

export function classicLayoutForPath(pathname: string): ClassicLayout {
	if (classicNativePage(pathname)) return 'compact';
	if (informationPageForPath(pathname)) return 'compact';
	return routeLayouts[pathname.replace(/\/$/, '') || '/'] ?? 'news';
}
import { informationPageForPath } from '$lib/information';

import { classicNativePage } from './native-pages';
