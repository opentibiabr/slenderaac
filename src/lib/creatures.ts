export type CreatureRecord = {
	id: string;
	aliases?: string[];
	name: string;
	outfit: Record<string, number>;
	raceId: number | null;
	health: number;
	experience: number;
	manaCost: number;
	summonable: boolean;
	convinceable: boolean;
	bestiary: boolean;
	locations: string;
	bossCategory: 'Archfoe' | 'Bane' | 'Nemesis' | null;
	bossRaceId: number | null;
	elements: { type: string; percent: number }[];
	loot: string[];
};

export function parseCreatureRecords(value: unknown): CreatureRecord[] {
	if (!Array.isArray(value) || value.length > 20000)
		throw new Error('Invalid creature catalog');
	const ids = new Set<string>();
	return value.map((item: unknown) => {
		if (!item || typeof item !== 'object') throw new Error('Invalid creature');
		const record = item as Record<string, unknown>;
		for (const key of ['id', 'name', 'locations'])
			if (
				typeof record[key] !== 'string' ||
				record[key].length > (key === 'locations' ? 5000 : 200)
			)
				throw new Error(`Invalid creature ${key}`);
		if (!record.name) throw new Error('Missing creature name');
		if (
			!record.outfit ||
			typeof record.outfit !== 'object' ||
			Array.isArray(record.outfit) ||
			Object.entries(record.outfit).some(
				([key, value]) =>
					![
						'lookType',
						'lookTypeEx',
						'lookHead',
						'lookBody',
						'lookLegs',
						'lookFeet',
						'lookAddons',
						'lookMount',
					].includes(key) ||
					!Number.isSafeInteger(value) ||
					Number(value) < 0 ||
					Number(value) > 65535,
			)
		)
			throw new Error('Invalid creature outfit');
		if (
			record.aliases !== undefined &&
			(!Array.isArray(record.aliases) || record.aliases.length > 50)
		)
			throw new Error('Invalid creature aliases');
		for (const id of [
			record.id,
			...((record.aliases as unknown[] | undefined) ?? []),
		]) {
			if (
				typeof id !== 'string' ||
				!/^[a-z0-9]{1,120}$/.test(id) ||
				ids.has(id)
			)
				throw new Error('Invalid or duplicate creature identity');
			ids.add(id);
		}
		for (const key of [
			'health',
			'experience',
			'manaCost',
			'raceId',
			'bossRaceId',
		]) {
			if ((key === 'raceId' || key === 'bossRaceId') && record[key] === null)
				continue;
			if (
				!Number.isSafeInteger(record[key]) ||
				Number(record[key]) < 0 ||
				Number(record[key]) > 4294967295
			)
				throw new Error(`Invalid creature ${key}`);
		}
		for (const key of ['summonable', 'convinceable', 'bestiary'])
			if (typeof record[key] !== 'boolean')
				throw new Error(`Invalid creature ${key}`);
		if (
			record.bossCategory !== null &&
			!['Archfoe', 'Bane', 'Nemesis'].includes(String(record.bossCategory))
		)
			throw new Error('Invalid boss category');
		if (!Array.isArray(record.elements) || record.elements.length > 20)
			throw new Error('Invalid creature elements');
		const elementTypes = new Set<string>();
		for (const entry of record.elements as unknown[]) {
			if (!entry || typeof entry !== 'object')
				throw new Error('Invalid creature elements');
			const element = entry as Record<string, unknown>;
			if (
				typeof element.type !== 'string' ||
				![
					'Physical',
					'Energy',
					'Earth',
					'Fire',
					'Ice',
					'Holy',
					'Death',
					'Life Drain',
					'Mana Drain',
					'Drowning',
				].includes(element.type) ||
				elementTypes.has(element.type) ||
				!Number.isSafeInteger(element.percent) ||
				Number(element.percent) < -10000 ||
				Number(element.percent) > 10000
			)
				throw new Error('Invalid creature elements');
			elementTypes.add(element.type);
		}
		if (
			!Array.isArray(record.loot) ||
			record.loot.length > 1000 ||
			!record.loot.every(
				(name) =>
					typeof name === 'string' && name.length > 0 && name.length <= 200,
			)
		)
			throw new Error('Invalid creature loot');
		return record as CreatureRecord;
	});
}

export function creatureCatalog(records: CreatureRecord[], boss = false) {
	return records
		.filter((entry) =>
			boss
				? entry.bossCategory === 'Archfoe' && Boolean(entry.bossRaceId)
				: entry.bestiary,
		)
		.sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

/** Race IDs may be shared by variants; only a unique match can resolve by ID. */
export type CreatureCatalogIdentity = Pick<
	CreatureRecord,
	'id' | 'name' | 'raceId' | 'bossRaceId'
>;

export function boostedCatalogEntry<T extends CreatureCatalogIdentity>(
	records: T[],
	name: string | null,
	raceId?: number,
	boss = false,
): T | null {
	const identity = (entry: CreatureCatalogIdentity) =>
		boss ? entry.bossRaceId : entry.raceId;
	const named =
		name &&
		records.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
	if (named && (!raceId || identity(named) === raceId)) return named;
	const matches = records.filter(
		(entry) => raceId && identity(entry) === raceId,
	);
	return matches.length === 1 ? matches[0] : null;
}

export function creatureSentences(creature: CreatureRecord): string[] {
	const list = (values: string[]) =>
		new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(
			values,
		);
	const types = (test: (percent: number) => boolean) =>
		creature.elements
			.filter((element) => test(element.percent))
			.map((element) => element.type.toLowerCase());
	const facts = [`${creature.name} has ${creature.health} hitpoints.`];
	for (const [label, matches] of [
		['immune to', types((percent) => percent >= 100)],
		['strong against', types((percent) => percent > 0 && percent < 100)],
		['weak against', types((percent) => percent < 0)],
	] as const)
		if (matches.length) facts.push(`It is ${label} ${list(matches)} damage.`);
	if (!creature.summonable && !creature.convinceable)
		facts.push('It can neither be summoned nor convinced.');
	else {
		const actions = [
			creature.summonable ? 'summoned' : '',
			creature.convinceable ? 'convinced' : '',
		].filter(Boolean);
		facts.push(`It can be ${list(actions)} for ${creature.manaCost} mana.`);
	}
	return [
		...(creature.locations
			? [
					`${creature.name} can be found in the following locations: ${creature.locations}`,
				]
			: []),
		facts.join(' '),
		`${creature.name} yields ${creature.experience} base experience points.${creature.loot.length ? ` Its loot can include ${list(creature.loot)}.` : ''}`,
	];
}
