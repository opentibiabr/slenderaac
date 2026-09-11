import assert from 'node:assert/strict';
import { test } from 'node:test';

const origin = process.env.CLASSIC_TEST_ORIGIN;

// Opt in against the existing local app without starting the game or changing data.
void test(
	'online and world pages distinguish availability from population in both layouts',
	{ skip: !origin, timeout: 30000 },
	async () => {
		const base = new URL(origin!);
		assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname));
		const statusResponse = await fetch(new URL('/api/online-status', base));
		assert.equal(statusResponse.status, 200);
		const status = (await statusResponse.json()) as {
			serverOnline: boolean;
		};
		assert.equal(typeof status.serverOnline, 'boolean');
		for (const theme of ['classic', 'legbone']) {
			for (const path of ['/online', '/worlds']) {
				const url = new URL(path, base);
				url.searchParams.set('themePreview', theme);
				const response = await fetch(url);
				assert.equal(response.status, 200);
				const html = await response.text();
				const text = html
					.replace(/<!--[\s\S]*?-->|<[^>]*>/g, ' ')
					.replace(/\s+/g, ' ');
				if (path === '/online') {
					assert.match(
						text,
						status.serverOnline ? /Status: Online/ : /Status: Offline/,
					);
					if (!status.serverOnline) {
						assert.match(text, /Players Online: —/);
						assert.match(
							text,
							/The server is offline\. The online player list is unavailable\./,
						);
					}
				} else {
					const worldLink = html.match(/href="([^"\s]*\/worlds\?world=[^"]+)"/);
					assert.ok(
						worldLink,
						'The configured world must have a local detail link',
					);
					const details = await fetch(
						new URL(worldLink[1].replaceAll('&amp;', '&'), base),
					);
					assert.equal(details.status, 200);
					const detailText = (await details.text())
						.replace(/<!--[\s\S]*?-->|<[^>]*>/g, ' ')
						.replace(/\s+/g, ' ');
					assert.match(
						detailText,
						status.serverOnline ? /Status: Online/ : /Status: Offline/,
					);
					if (!status.serverOnline) {
						assert.match(text, /Offline/);
						assert.match(detailText, /Players Online: —/);
						assert.match(
							detailText,
							/The server is offline\. The online player list is unavailable\./,
						);
					}
				}
			}
		}
	},
);
