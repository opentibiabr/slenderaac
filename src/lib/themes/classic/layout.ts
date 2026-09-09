export type ClassicLayout = 'news' | 'compact' | 'compact-wide';

const routeLayouts: Record<string, ClassicLayout> = {
	'/': 'news',
	'/news/archive': 'compact',
	'/news/event-schedule': 'compact-wide',
};

export function classicLayoutForPath(pathname: string): ClassicLayout {
	return routeLayouts[pathname.replace(/\/$/, '') || '/'] ?? 'compact';
}
