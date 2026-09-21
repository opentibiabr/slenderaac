import type { InformationGallery } from './information-content';

type GalleryItem = InformationGallery['items'][number];

export function dailyScreenshot(items: GalleryItem[], now = Date.now()) {
	if (!items.length) return null;
	const day = Math.floor(now / 86_400_000);
	return items[((day % items.length) + items.length) % items.length];
}

export function adjacentScreenshot(
	items: GalleryItem[],
	currentId: number,
	direction: -1 | 1,
) {
	const index = items.findIndex((item) => item.id === currentId);
	if (index < 0) return null;
	return items[(index + direction + items.length) % items.length];
}
