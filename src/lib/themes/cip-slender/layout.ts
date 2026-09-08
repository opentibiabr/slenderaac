export type CipLayout = 'news' | 'compact' | 'compact-wide';

const routeLayouts: Record<string, CipLayout> = {
	'/news/archive': 'compact',
	'/news/event-schedule': 'compact-wide',
};

export function cipLayoutForPath(pathname: string): CipLayout {
	return routeLayouts[pathname.replace(/\/$/, '') || '/'] ?? 'news';
}
