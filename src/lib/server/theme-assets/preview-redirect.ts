import { themePreviewHref } from '$lib/themes/preview';

/** Preserve an explicit preview across native and SvelteKit data/action redirects. */
export async function preservePreviewRedirect(
	response: Response,
	current: URL,
	serialized: boolean,
): Promise<Response> {
	if (!current.searchParams.has('themePreview')) return response;
	const location = response.headers.get('location');
	if (response.status >= 300 && response.status < 400 && location) {
		const target = themePreviewHref(current, location);
		if (target === location) return response;
		const headers = new Headers(response.headers);
		headers.set('location', target);
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		});
	}
	if (
		!serialized ||
		!response.headers.get('content-type')?.includes('application/json')
	)
		return response;
	const body: unknown = await response
		.clone()
		.json()
		.catch(() => null);
	if (
		!body ||
		typeof body !== 'object' ||
		!('type' in body) ||
		body.type !== 'redirect' ||
		!('location' in body) ||
		typeof body.location !== 'string'
	)
		return response;
	const target = themePreviewHref(current, body.location);
	if (target === body.location) return response;
	const headers = new Headers(response.headers);
	headers.delete('content-length');
	headers.delete('etag');
	return new Response(JSON.stringify({ ...body, location: target }), {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
