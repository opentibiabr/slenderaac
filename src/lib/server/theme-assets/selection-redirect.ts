import {
	copyLayoutSelection,
	hasLayoutSelection,
	layoutSelectionKeys,
} from '$lib/themes/navigation';

function selectionRedirectHref(current: URL, href: string): string {
	let target: URL;
	try {
		target = new URL(href, current);
	} catch {
		return href;
	}
	if (target.origin !== current.origin) return href;
	copyLayoutSelection(current, target);
	return `${target.pathname}${target.search}${target.hash}`;
}

function isCanonicalSelectionRedirect(current: URL, location: string): boolean {
	let target: URL;
	try {
		target = new URL(location, current);
	} catch {
		return false;
	}
	const canonical = new URL(current);
	for (const key of layoutSelectionKeys) canonical.searchParams.delete(key);
	return (
		target.origin === canonical.origin &&
		target.pathname === canonical.pathname &&
		target.search === canonical.search
	);
}

/** Carry a transient layout request across redirects until the root layout persists it. */
export async function preserveLayoutSelectionRedirect(
	response: Response,
	current: URL,
	serialized: boolean,
): Promise<Response> {
	if (!hasLayoutSelection(current)) return response;
	const location = response.headers.get('location');
	if (response.status >= 300 && response.status < 400 && location) {
		if (isCanonicalSelectionRedirect(current, location)) return response;
		const target = selectionRedirectHref(current, location);
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
	if (isCanonicalSelectionRedirect(current, body.location)) return response;
	const target = selectionRedirectHref(current, body.location);
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
