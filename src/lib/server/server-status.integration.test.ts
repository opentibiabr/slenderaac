import assert from 'node:assert/strict';
import { test } from 'node:test';

const origin = process.env.CLASSIC_TEST_ORIGIN;
const integrationTest = origin ? test : test.skip;

// Opt in against the existing local app without starting the game or changing data.
void integrationTest(
	'online and world pages distinguish availability from population in both layouts',
	{ timeout: 30000 },
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
			const selection = await fetch(new URL(`/online?layout=${theme}`, base), {
				redirect: 'manual',
			});
			assert.equal(selection.status, 307);
			assert.equal(selection.headers.get('location'), '/online');
			const setCookie = selection.headers.get('set-cookie');
			assert.ok(setCookie);
			const cookie = setCookie.split(';', 1)[0];
			assert.equal(cookie, `slender-theme=${theme}`);
			for (const path of ['/online', '/worlds']) {
				const url = new URL(path, base);
				const response = await fetch(url, { headers: { cookie } });
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
						{ headers: { cookie } },
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
