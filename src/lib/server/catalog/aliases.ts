import { type CreatureRecord, parseCreatureRecords } from '$lib/creatures';
import { parseSpellRecords, type SpellRecord } from '$lib/spells';

/** Saved links can retain their identity after an operator renames an entry. */
export function applySpellAliases(spells: SpellRecord[], value: unknown) {
	return parseSpellRecords(applyAliases(spells, value));
}

export function applyCreatureAliases(
	creatures: CreatureRecord[],
	value: unknown,
) {
	return parseCreatureRecords(applyAliases(creatures, value));
}

function applyAliases<
	T extends { id: string; name: string; aliases?: string[] },
>(entries: T[], value: unknown) {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		throw new Error('Invalid catalog alias map');
	const result = entries.map((spell) => ({
		...spell,
		aliases: [...(spell.aliases ?? [])],
	}));
	for (const [alias, name] of Object.entries(value)) {
		const spell = result.find(
			(spell) => spell.name === name || spell.id === name,
		);
		if (!spell) throw new Error(`Alias ${alias} has no matching server entry`);
		if (alias !== spell.id && !spell.aliases.includes(alias))
			spell.aliases.push(alias);
	}
	return result;
}
