import fs from 'node:fs/promises';

import type { SpellRecord } from '$lib/spells';
import {
	type AchievementRecord,
	parseAchievementRecords,
} from '$lib/achievements';
import { type CreatureRecord, parseCreatureRecords } from '$lib/creatures';
import { parseSpellRecords } from '$lib/spells';
import { parseWorldConfig, type WorldConfig } from '$lib/worlds';

import { env } from '$env/dynamic/private';

let cache: {
	path: string;
	stamp: number;
	size: number;
	spells: SpellRecord[];
	creatures: CreatureRecord[];
	achievements: AchievementRecord[];
	world: WorldConfig;
} | null = null;

export async function loadSpells(): Promise<SpellRecord[]> {
	return (await loadCatalog()).spells;
}

export async function loadCreatures(): Promise<CreatureRecord[]> {
	return (await loadCatalog()).creatures;
}

export async function loadAchievements(): Promise<AchievementRecord[]> {
	return (await loadCatalog()).achievements;
}

export async function loadWorldConfig(): Promise<WorldConfig> {
	return (await loadCatalog()).world;
}

async function loadCatalog() {
	if (!env.SERVER_DATA_FILE)
		return { spells: [], creatures: [], achievements: [], world: {} };
	const file = await fs.realpath(env.SERVER_DATA_FILE);
	const stat = await fs.stat(file);
	if (!stat.isFile() || stat.size > 20_000_000)
		throw new Error('Invalid server data file');
	if (
		cache?.path === file &&
		cache.stamp === stat.mtimeMs &&
		cache.size === stat.size
	)
		return cache;
	const value: unknown = JSON.parse(await fs.readFile(file, 'utf8'));
	if (
		!value ||
		typeof value !== 'object' ||
		!('schemaVersion' in value) ||
		value.schemaVersion !== 1 ||
		!('spells' in value)
	)
		throw new Error('Invalid server data format');
	const spells = parseSpellRecords(value.spells);
	const creatures =
		'creatures' in value ? parseCreatureRecords(value.creatures) : [];
	const achievements =
		'achievements' in value ? parseAchievementRecords(value.achievements) : [];
	const world = 'world' in value ? parseWorldConfig(value.world) : {};
	cache = {
		path: file,
		stamp: stat.mtimeMs,
		size: stat.size,
		spells,
		creatures,
		achievements,
		world,
	};
	return cache;
}
