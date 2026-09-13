import assert from 'node:assert/strict';
import { test } from 'node:test';

const integrationTest =
	process.env.RUN_SUPPORT_INTEGRATION === '1' ? test : test.skip;

// Opt in against the running local site; this smoke test never writes data.
void integrationTest(
	'public support routes and invalid selections work in both themes',
	async () => {
		const origin = 'http://127.0.0.1:5173';
		for (const theme of ['classic', 'legbone']) {
			const selection = await fetch(
				`${origin}/support/get-help?layout=${theme}`,
				{ redirect: 'manual' },
			);
			assert.equal(selection.status, 307);
			assert.equal(selection.headers.get('location'), '/support/get-help');
			const setCookie = selection.headers.get('set-cookie');
			assert.ok(setCookie);
			const cookie = setCookie.split(';', 1)[0];
			assert.equal(cookie, `slender-theme=${theme}`);
			for (const route of ['get-help', 'parents-guide', 'legal-documents']) {
				const response = await fetch(`${origin}/support/${route}`, {
					headers: { cookie },
				});
				assert.equal(response.status, 200);
			}
			const response = await fetch(
				`${origin}/support/legal-documents?page=privacy`,
				{ redirect: 'manual', headers: { cookie } },
			);
			assert.equal(response.headers.get('location'), '/support/privacy-policy');
			assert.equal(
				(
					await fetch(`${origin}/support/get-help?topic=unknown`, {
						headers: { cookie },
					})
				).status,
				400,
			);
			assert.equal(
				(
					await fetch(`${origin}/support/get-help?topic=account&page=9999`, {
						headers: { cookie },
					})
				).status,
				404,
			);
		}
		assert.equal(
			(await fetch(`${origin}/admin/help`, { redirect: 'manual' })).status,
			302,
		);
		assert.equal(
			(await fetch(`${origin}/support/legal-documents?page=unknown`)).status,
			404,
		);
	},
);
