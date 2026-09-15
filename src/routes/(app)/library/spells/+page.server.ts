import { error } from '@sveltejs/kit';

import { loadSpells } from '$lib/server/catalog';
import { filterSpells } from '$lib/spells';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const catalog = await loadSpells();
	const selection = url.searchParams.get('spell');
	const selectedSpell = selection
		? (catalog.find(
				(spell) => spell.id === selection || spell.aliases?.includes(selection),
			) ?? null)
		: null;
	if (selection && !selectedSpell) throw error(404, 'Spell not found');
	return {
		title: 'Spells',
		...filterSpells(catalog, url.searchParams),
		selectedSpell,
		configured: catalog.length > 0,
	};
};
