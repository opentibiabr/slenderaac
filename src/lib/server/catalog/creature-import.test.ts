import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	boostedCatalogEntry,
	creatureCatalog,
	creatureSentences,
	parseCreatureRecords,
} from '$lib/creatures';

import { applyCreatureAliases } from './aliases';
import { importCreatureCatalog, readItemNames } from './creature-import';

const definition = `
local mType = Game.createMonsterType("Forest Guardian")
local monster = {}
monster.health = 250
monster.maxHealth = monster.health
monster.experience = 100
monster.outfit = {lookType = 99}
monster.raceId = 42
monster.manaCost = 500
monster.Bestiary = {class = "Forest", race = BESTY_RACE_FOREST, Locations = "The northern woods."}
monster.flags = {summonable = false, convinceable = true, attackable = true}
monster.elements = {{type = COMBAT_EARTHDAMAGE, percent = 100}, {type = COMBAT_FIREDAMAGE, percent = -20}, {type = COMBAT_ICEDAMAGE, percent = 10}}
monster.loot = {{id = 12, chance = 50000}, {name = "leaf", chance = 2000}, {id = 13, chance = 0}}
function mType.onThink() error("must not execute") end
mType:register(monster)
`;
const items = readItemNames(
	`<items><item id="12" name="guardian's tooth"/><item fromid="20" toid="22" name="salt &amp; pepper"/><!-- <item id="12" name="wrong"/> --></items>`,
);
const load = (source = definition) =>
	importCreatureCatalog(new Map([['monster/guardian.lua', source]]), items);

void test('creature facts and item names come from literal registrations without running callbacks', () => {
	const creature = load()[0];
	assert.equal(creature.health, 250);
	assert.deepEqual(creature.loot, ["guardian's tooth", 'leaf']);
	assert.equal(items.get(22), 'salt & pepper');
	assert.equal(creature.locations, 'The northern woods.');
	assert.match(creatureSentences(creature).join(' '), /immune to earth damage/);
	assert.match(creatureSentences(creature).join(' '), /convinced for 500 mana/);
	assert.match(creatureSentences(creature).join(' '), /100 base experience/);
	assert.deepEqual(load(definition.replace('id = 12', 'id = 999'))[0].loot, [
		'item #999',
		'leaf',
	]);
});

void test('creature constants bind at assignment and later helpers cannot change exported registrations', () => {
	const source = definition.replace(
		'monster.health = 250',
		'local hp = 250\nmonster.health = hp\nhp = 400',
	);
	assert.equal(load(source)[0].health, 250);
	assert.equal(load(source + '\nCreateVariant(monster)')[0].health, 250);
	assert.throws(
		() => load(source + '\nCreateVariant(monster)\nmType:register(monster)'),
		/Unresolved metadata/,
	);
	assert.throws(
		() =>
			load(
				definition.replace(
					'monster.health = 250',
					'monster.health = dynamicHealth',
				),
			),
		/Unresolved metadata/,
	);
	assert.throws(
		() =>
			load(
				definition.replace(
					'monster.health = 250',
					'if enabled then monster.health = 250 end',
				),
			),
		/Conditional monster/,
	);
	assert.throws(
		() =>
			load(
				definition.replace(
					'mType:register(monster)',
					'UpdateStats(monster)\nmType:register(monster)',
				),
			),
		/Dynamic monster/,
	);
	for (const mutation of [
		'monster["health"] = 999',
		'monster.flags.summonable = true',
		'local flags = monster.flags\nflags.summonable = true',
		'table.insert(monster.loot, {name = "secret", chance = 1000})',
	])
		assert.throws(
			() =>
				load(
					definition.replace(
						'mType:register(monster)',
						`${mutation}\nmType:register(monster)`,
					),
				),
			/requires an explicit export/,
		);
});

void test('resistance limits follow registration rules and preserve full elemental immunity', () => {
	const limited = importCreatureCatalog(
		new Map([['guardian.lua', definition]]),
		items,
		{ min: -10, max: 50 },
	)[0];
	assert.deepEqual(
		limited.elements.map((element) => element.percent),
		[50, -10, 10],
	);
	const immune = definition.replace(
		/monster.elements = .*\n/,
		'monster.elements = {' +
			['PHYSICAL', 'ENERGY', 'EARTH', 'FIRE', 'ICE', 'HOLY', 'DEATH']
				.map((type) => `{type = COMBAT_${type}DAMAGE, percent = 100}`)
				.join(',') +
			'}\n',
	);
	assert.ok(
		importCreatureCatalog(new Map([['immune.lua', immune]]), items, {
			min: -10,
			max: 50,
		})[0].elements.every((element) => element.percent === 100),
	);
	assert.throws(
		() => importCreatureCatalog(new Map(), items, { min: 1, max: -1 }),
		/Invalid elemental/,
	);
});

void test('catalogs preserve variants, reject ambiguous aliases and resolve boosted identities conservatively', () => {
	const first = load()[0];
	const variants = [
		first,
		{ ...first, id: 'blueguardian', name: 'Blue Guardian' },
	];
	assert.equal(creatureCatalog(variants).length, 2);
	assert.equal(
		boostedCatalogEntry(variants, 'blue guardian', 42)?.id,
		'blueguardian',
	);
	assert.equal(boostedCatalogEntry(variants, null, 42), null);
	assert.equal(boostedCatalogEntry([first], null, 42)?.id, first.id);
	assert.equal(boostedCatalogEntry([first], first.name, 99), null);
	assert.equal(
		boostedCatalogEntry([{ ...first, bossRaceId: 88 }], first.name, 88, true)
			?.id,
		first.id,
	);
	assert.deepEqual(
		applyCreatureAliases(variants, { oldguardian: 'Forest Guardian' })[0]
			.aliases,
		['oldguardian'],
	);
	assert.throws(
		() => applyCreatureAliases(variants, { blueguardian: 'Forest Guardian' }),
		/duplicate/,
	);
	assert.throws(
		() => parseCreatureRecords([{ ...first, health: -1 }]),
		/Invalid creature health/,
	);
	assert.throws(
		() =>
			parseCreatureRecords([
				{ ...first, elements: [...first.elements, first.elements[0]] },
			]),
		/Invalid creature elements/,
	);
});

void test('boostable boss listings select Archfoe registrations without collapsing shared race IDs', () => {
	const bosses = ['ARCHFOE', 'BANE', 'NEMESIS'].flatMap((rarity, index) =>
		load(
			definition
				.replace('Forest Guardian', `Guardian ${index}`)
				.replace(
					'monster.raceId = 42',
					`monster.bosstiary = {bossRaceId = 90, bossRace = RARITY_${rarity}}`,
				),
		),
	);
	assert.deepEqual(
		creatureCatalog(bosses, true).map((entry) => entry.name),
		['Guardian 0'],
	);
	assert.equal(
		creatureCatalog(
			[...bosses, { ...bosses[0], id: 'guardianform', name: 'Guardian Form' }],
			true,
		).length,
		2,
	);
});
