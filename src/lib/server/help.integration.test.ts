import assert from 'node:assert/strict';
import { test } from 'node:test';

// Opt in against the running local site; this smoke test never writes data.
void test(
	'public support routes and invalid selections work in both themes',
	{ skip: process.env.RUN_SUPPORT_INTEGRATION !== '1' },
	async () => {
		const origin = 'http://127.0.0.1:5173';
		for (const theme of ['classic', 'legbone']) {
			for (const route of ['get-help', 'parents-guide', 'legal-documents']) {
				const response = await fetch(
					`${origin}/support/${route}?themePreview=${theme}`,
				);
				assert.equal(response.status, 200);
			}
			const response = await fetch(
				`${origin}/support/legal-documents?page=privacy&themePreview=${theme}`,
				{ redirect: 'manual' },
			);
			assert.equal(
				response.headers.get('location'),
				`/support/privacy-policy?themePreview=${theme}`,
			);
			assert.equal(
				(
					await fetch(
						`${origin}/support/get-help?topic=unknown&themePreview=${theme}`,
					)
				).status,
				400,
			);
			assert.equal(
				(
					await fetch(
						`${origin}/support/get-help?topic=account&page=9999&themePreview=${theme}`,
					)
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
