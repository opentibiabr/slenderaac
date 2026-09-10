import { fail } from '@sveltejs/kit';

import { themePreviewHref } from '$lib/themes/preview';

export const communityFormFailure = (
	status: number,
	errors: Record<string, string[]>,
	values: Record<string, string> = {},
) => fail(status, { errors, values });

export function communityLoginHref(url: URL) {
	const query = new URLSearchParams({ returnTo: url.pathname + url.search });
	return themePreviewHref(url, `/account/login?${query.toString()}`);
}
