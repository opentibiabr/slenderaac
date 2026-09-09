import { parseSpellRecords, type SpellRecord } from '$lib/spells';

/** Saved links can retain their identity after an operator renames an entry. */
export function applySpellAliases(spells: SpellRecord[], value: unknown) {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		throw new Error('Invalid spell alias map');
	const result = spells.map((spell) => ({
		...spell,
		aliases: [...(spell.aliases ?? [])],
	}));
	for (const [alias, name] of Object.entries(value)) {
		const spell = result.find(
			(spell) => spell.name === name || spell.id === name,
		);
		if (!spell) throw new Error(`Alias ${alias} has no matching server spell`);
		if (alias !== spell.id && !spell.aliases.includes(alias))
			spell.aliases.push(alias);
	}
	return parseSpellRecords(result);
}
