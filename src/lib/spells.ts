export type SpellRecord = {
	id: string;
	aliases?: string[];
	name: string;
	words: string;
	vocations: string[];
	group: string;
	magicType: string;
	secondaryGroup: string;
	type: 'Instant' | 'Rune';
	level: number;
	mana: number;
	manaPercent: number;
	variableMana: boolean;
	soul: number;
	amount: number;
	cooldown: number;
	groupCooldown: number;
	secondaryCooldown: number;
	premium: boolean;
	learnable: boolean;
	hasParams: boolean;
	rune: {
		group: string;
		magicType: string;
		vocations: string[];
		itemId: number;
		level: number;
		magicLevel: number;
		charges: number;
	} | null;
};

export const spellSorts = {
	name: 'Name',
	group: 'Group',
	type: 'Type',
	level: 'Exp Lvl',
	mana: 'Mana',
	premium: 'Premium',
};
export type SpellSort = keyof typeof spellSorts;

export function spellMana(spell: SpellRecord): string {
	if (spell.variableMana) return 'var.';
	if (spell.manaPercent) return `${spell.manaPercent}%`;
	return String(spell.mana);
}

export function filterSpells(spells: SpellRecord[], query: URLSearchParams) {
	const vocations = [
		...new Set(spells.flatMap((spell) => spell.vocations)),
	].sort();
	const groups = [...new Set(spells.map((spell) => spell.group))].sort();
	const choice = (name: string, values: string[]) => {
		const value = query.get(name) ?? '';
		return values.includes(value) ? value : '';
	};
	const filters = {
		vocation: choice('vocation', vocations),
		group: choice('group', groups),
		type: choice('type', ['Instant', 'Rune']),
		premium: choice('premium', ['yes', 'no']),
		sort: (choice('sort', Object.keys(spellSorts)) || 'name') as SpellSort,
	};
	const matches = spells
		.filter(
			(spell) =>
				(!filters.vocation ||
					!spell.vocations.length ||
					spell.vocations.includes(filters.vocation)) &&
				(!filters.group || spell.group === filters.group) &&
				(!filters.type || spell.type === filters.type) &&
				(!filters.premium || spell.premium === (filters.premium === 'yes')),
		)
		.sort((a, b) => {
			const left = a[filters.sort];
			const right = b[filters.sort];
			const order =
				typeof left === 'string' && typeof right === 'string'
					? left.localeCompare(right, 'en')
					: Number(left) - Number(right);
			return order || a.name.localeCompare(b.name, 'en');
		});
	return { spells: matches, filters, vocations, groups };
}

export function parseSpellRecords(value: unknown): SpellRecord[] {
	if (!Array.isArray(value) || value.length > 10000)
		throw new Error('Invalid spell catalog');
	const ids = new Set<string>();
	return value.map((item: unknown) => {
		if (!item || typeof item !== 'object')
			throw new Error('Invalid spell entry');
		const record = item as Record<string, unknown>;
		for (const name of [
			'id',
			'name',
			'words',
			'group',
			'secondaryGroup',
			'magicType',
		])
			if (typeof record[name] !== 'string' || record[name].length > 200)
				throw new Error(`Invalid spell ${name}`);
		if (
			!/^[a-z0-9]{1,120}$/.test(record.id as string) ||
			ids.has(record.id as string)
		)
			throw new Error('Invalid or duplicate spell identity');
		if (
			record.aliases !== undefined &&
			(!Array.isArray(record.aliases) ||
				record.aliases.length > 50 ||
				!record.aliases.every(
					(alias) =>
						typeof alias === 'string' && /^[a-z0-9]{1,120}$/.test(alias),
				))
		)
			throw new Error('Invalid spell aliases');
		for (const id of [
			record.id as string,
			...((record.aliases as string[] | undefined) ?? []),
		]) {
			if (ids.has(id)) throw new Error('Invalid or duplicate spell identity');
			ids.add(id);
		}
		for (const name of [
			'level',
			'mana',
			'manaPercent',
			'soul',
			'amount',
			'cooldown',
			'groupCooldown',
			'secondaryCooldown',
		])
			if (
				!Number.isSafeInteger(record[name]) ||
				Number(record[name]) < 0 ||
				Number(record[name]) > 4294967295
			)
				throw new Error(`Invalid spell ${name}`);
		for (const name of ['variableMana', 'premium', 'learnable', 'hasParams'])
			if (typeof record[name] !== 'boolean')
				throw new Error(`Invalid spell ${name}`);
		if (!['Instant', 'Rune'].includes(String(record.type)))
			throw new Error('Invalid spell type');
		if (
			!Array.isArray(record.vocations) ||
			record.vocations.length > 50 ||
			!record.vocations.every((v) => typeof v === 'string' && v.length <= 100)
		)
			throw new Error('Invalid spell vocations');
		if (record.rune !== null) {
			if (!record.rune || typeof record.rune !== 'object')
				throw new Error('Invalid rune');
			const rune = record.rune as Record<string, unknown>;
			for (const key of ['itemId', 'level', 'magicLevel', 'charges']) {
				const number = rune[key];
				if (
					!Number.isSafeInteger(number) ||
					Number(number) < 0 ||
					Number(number) > 4294967295
				)
					throw new Error('Invalid rune value');
			}
			for (const key of ['group', 'magicType'])
				if (typeof rune[key] !== 'string' || rune[key].length > 200)
					throw new Error('Invalid rune text');
			if (
				!Array.isArray(rune.vocations) ||
				rune.vocations.length > 50 ||
				!rune.vocations.every((v) => typeof v === 'string' && v.length <= 100)
			)
				throw new Error('Invalid rune vocations');
		}
		return record as SpellRecord;
	});
}
