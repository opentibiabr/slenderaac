import { error } from '@sveltejs/kit';

import { loadHelp, recordHelpView } from '$lib/server/help';
import { loadThemeAssetMetadata } from '$lib/server/theme-assets/manifest';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ url }) => ({
	title: 'FAQ',
	help: await loadHelp(url.searchParams),
	artwork: Object.fromEntries(
		Object.entries((await loadThemeAssetMetadata('classic')).assets).filter(
			([key]) => key.startsWith('helpTopic-') || key === 'helpSearch',
		),
	),
})) satisfies PageServerLoad;

export const actions = {
	view: async ({ request, cookies }) => {
		const input = await request.formData();
		const slug = input.get('article');
		if (typeof slug !== 'string' || !/^[a-z0-9-]{1,80}$/.test(slug))
			throw error(400, 'Invalid help article');
		// Count visible article visits rather than SvelteKit preloads. A bounded
		// same-site cookie avoids repeated refreshes inflating the public list.
		const recent = (cookies.get('help_views') ?? '')
			.split('|')
			.filter((value) => /^[a-z0-9-]{1,80}$/.test(value));
		if (!recent.includes(slug)) {
			const result = await recordHelpView(slug);
			if (!result.count) throw error(404, 'Help article not found');
			cookies.set('help_views', [...recent.slice(-19), slug].join('|'), {
				path: '/support/get-help',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 3600,
			});
		}
		return { counted: true };
	},
} satisfies Actions;
