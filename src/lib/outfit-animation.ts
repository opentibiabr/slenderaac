export type OutfitFrame = { image: string; duration: number };

export function outfitFrameData(value: unknown): OutfitFrame[] {
	if (
		!value ||
		typeof value !== 'object' ||
		!('frames' in value) ||
		!Array.isArray(value.frames) ||
		value.frames.length > 128
	)
		return [];
	const frames: OutfitFrame[] = [];
	for (const item of value.frames as unknown[]) {
		if (
			!item ||
			typeof item !== 'object' ||
			!('image' in item) ||
			typeof item.image !== 'string' ||
			!/^data:image\/png;base64,[a-z\d+/]+=*$/i.test(item.image) ||
			item.image.length > 2_000_000 ||
			!('duration' in item) ||
			typeof item.duration !== 'number' ||
			!Number.isFinite(item.duration) ||
			item.duration <= 0 ||
			item.duration > 60_000
		)
			return [];
		frames.push({ image: item.image, duration: item.duration });
	}
	return frames;
}
