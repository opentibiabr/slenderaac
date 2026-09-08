export type CipLayout = 'news' | 'compact' | 'compact-wide';

const routeLayouts: Record<string, CipLayout> = {
	'/news/archive': 'compact',
	'/news/event-schedule': 'compact-wide',
};

export function cipLayoutForPath(pathname: string): CipLayout {
	if (informationPageForPath(pathname)) return 'compact';
	return routeLayouts[pathname.replace(/\/$/, '') || '/'] ?? 'news';
}
import { informationPageForPath } from '$lib/information';
