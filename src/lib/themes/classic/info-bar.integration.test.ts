import assert from 'node:assert/strict';
import { test } from 'node:test';

import { configuredSiteLinks } from '$lib/site-links';

const origin = process.env.CLASSIC_TEST_ORIGIN;
const links = configuredSiteLinks(process.env);
const integrationTest = origin ? test : test.skip;

// Opt in against an already running local app; this test never starts or builds it.
for (const pathname of ['/', '/characters', '/houses', '/guides/quickstart']) {
	void integrationTest(
		`Classic retains both channel slots on ${pathname}`,
		{ timeout: 30000 },
		async () => {
			const url = new URL(pathname, origin);
			assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname));
			url.searchParams.set('layout', 'classic');
			const selection = await fetch(url, { redirect: 'manual' });
			assert.equal(selection.status, 307);
			assert.equal(selection.headers.get('location'), pathname);
			const setCookie = selection.headers.get('set-cookie');
			assert.ok(setCookie);
			const cookie = setCookie.split(';', 1)[0];
			assert.equal(cookie, 'slender-theme=classic');
			const response = await fetch(new URL(pathname, origin), {
				headers: { cookie },
			});
			assert.equal(response.status, 200);
			const html = await response.text();
			const statefulHrefs = [
				...html.matchAll(/href="([^"]*(?:layout=|themePreview=)[^"]*)"/g),
			].map((match) => match[1]);
			assert.equal(statefulHrefs.length, 2);
			assert.ok(statefulHrefs.every((href) => href.includes('layout=')));
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
			assert.match(bar, /Server Status Unknown/);
		},
	);
}
