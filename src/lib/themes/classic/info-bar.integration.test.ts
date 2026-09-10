import assert from 'node:assert/strict';
import { test } from 'node:test';

import { configuredSiteLinks } from '$lib/site-links';

const origin = process.env.CLASSIC_TEST_ORIGIN;
const links = configuredSiteLinks(process.env);

// Opt in against an already running local app; this test never starts or builds it.
for (const pathname of ['/', '/characters', '/houses', '/guides/quickstart']) {
	void test(
		`Classic retains both channel slots on ${pathname}`,
		{ skip: !origin, timeout: 30000 },
		async () => {
			const url = new URL(pathname, origin);
			assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname));
			url.searchParams.set('themePreview', 'classic');
			const response = await fetch(url);
			assert.equal(response.status, 200);
			const html = await response.text();
			const bar = html.match(
				/<div class="classic-info-bar\b[\s\S]*?<\/header>/,
			)?.[0];
			assert.ok(bar, 'Classic information bar must render');
			const slots = [
				...bar.matchAll(
					/<(a|span)\b([^>]*class="classic-info-channel\b[^>]*)>/g,
				),
			];
			assert.equal(slots.length, 2, 'Unconfigured channels must not disappear');
			assert.ok(bar.indexOf('Twitch') < bar.indexOf('YouTube'));
			for (const [index, href] of [links.twitch, links.youtube].entries()) {
				const [, tag, attributes] = slots[index];
				assert.equal(tag, href ? 'a' : 'span');
				if (href) {
					assert.ok(
						attributes.includes(
							`href="${href.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`,
						),
					);
					assert.ok(attributes.includes('target="_blank"'));
				} else {
					assert.doesNotMatch(attributes, /\bhref=/);
					assert.match(attributes, /channel not configured/);
				}
			}
			assert.match(bar, /Fankit/);
			assert.match(bar, /Players Online/);
		},
	);
}
