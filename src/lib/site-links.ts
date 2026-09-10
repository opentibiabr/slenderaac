export function websiteHref(value: string | undefined) {
	try {
		if (!value || value.length > 2048) return null;
		const url = new URL(value);
		if (
			!['http:', 'https:'].includes(url.protocol) ||
			url.username ||
			url.password
		)
			return null;
		return url.href;
	} catch {
		return null;
	}
}

export function configuredSiteLinks(
	values: Record<string, string | undefined>,
) {
	return {
		twitch: websiteHref(values.PUBLIC_TWITCH_URL),
		youtube: websiteHref(values.PUBLIC_YOUTUBE_URL),
		facebook: websiteHref(values.PUBLIC_FACEBOOK_URL),
		trailer: websiteHref(values.PUBLIC_TRAILER_URL),
	};
}

export function screenshotPageHref(presentationHref: string | undefined) {
	try {
		const index = new URL(
			presentationHref ?? '',
			'https://slender.invalid',
		).searchParams.get('currentscreenshot');
		if (index && /^[0-9]{1,6}$/.test(index))
			return `/about/screenshots?currentscreenshot=${index}`;
	} catch {
		/* An optional image selection never changes the local destination. */
	}
	return '/about/screenshots';
}
