import assert from 'node:assert/strict';
import { test } from 'node:test';

import { filterSpells, parseSpellRecords, spellMana } from '$lib/spells';

import { applySpellAliases } from './aliases';
import { importSpellCatalog } from './spell-import';

const vocations = new Map([
	['druid', 'Druid'],
	['elder druid', 'Druid'],
]);
const base = `
local combat = Combat()
combat:setParameter(COMBAT_PARAM_TYPE, COMBAT_HEALING)
local delay = 2 * 1000
local spell = Spell("instant")
function spell.onCastSpell(player, variant) error("must never execute") end
spell:name("Healing Touch")
spell:words("exura test")
spell:vocation("druid;true", "elder druid;true")
spell:group("healing")
spell:level(8)
spell:mana(20)
spell:cooldown(delay)
spell:isPremium(true)
spell:register()
`;
const load = (source = base) =>
	importSpellCatalog(new Map([['spell.lua', source]]), vocations);

void test('spell metadata resolves constants, promotions and combat types without executing callbacks', () => {
	const [spell] = load();
	assert.equal(spell.cooldown, 2000);
	assert.equal(spell.groupCooldown, 1000);
	assert.equal(spell.magicType, 'Healing');
	assert.deepEqual(spell.vocations, ['Druid']);
	assert.equal(spell.premium, true);
	assert.equal(spell.level, 8);
});

void test('spell values bind at the declaration call and preserve unicode strings', () => {
	const [spell] = load(
		base
			.replace(
				'local delay = 2 * 1000',
				'local delay = 2000\nlocal saved = delay\ndelay = 3000',
			)
			.replace('spell:cooldown(delay)', 'spell:cooldown(saved)\nsaved = 5000')
			.replace('Healing Touch', 'Bênção'),
	);
	assert.equal(spell.cooldown, 2000);
	assert.equal(spell.name, 'Bênção');
	assert.equal(
		load(
			base.replace(
				'spell:cooldown(delay)',
				'do local delay = 9000 end\nspell:cooldown(delay)',
			),
		)[0].cooldown,
		2000,
	);
	assert.throws(
		() =>
			load(
				base.replace(
					'local delay = 2 * 1000',
					'local delay = unknown\nunknown = 2000',
				),
			),
		/literal expression/,
	);
});

void test('rune requirements come from the conjured item registration and party mana remains variable', () => {
	const source = base.replace(
		'function spell.onCastSpell(player, variant) error("must never execute") end',
		'function spell.onCastSpell(player, variant) player:addMana(-cost) return player:conjureItem(1, 100, 4) end',
	);
	const runeSource = `
local combat = Combat()
combat:setParameter(COMBAT_PARAM_TYPE, COMBAT_ICEDAMAGE)
local rune = Spell("rune")
rune:name("A Rune")
rune:runeId(100)
rune:group("attack")
rune:level(10)
rune:magicLevel(2)
rune:charges(3)
rune:register()
`;
	const [spell] = importSpellCatalog(
		new Map([
			['spell.lua', source],
			['rune.lua', runeSource],
		]),
		vocations,
	);
	assert.equal(spell.type, 'Rune');
	assert.equal(spell.amount, 4);
	assert.equal(spell.magicType, 'Healing');
	assert.deepEqual(spell.rune, {
		itemId: 100,
		group: 'Attack',
		magicType: 'Ice',
		vocations: [],
		level: 10,
		magicLevel: 2,
		charges: 3,
	});
	assert.equal(spellMana(spell), 'var.');
});

void test('unresolved or conditional metadata rejects the import and internal spells stay hidden', () => {
	assert.throws(
		() =>
			load(
				base.replace(
					'spell:mana(20)',
					'spell:mana(configManager.getNumber(KEY))',
				),
			),
		/literal expression/,
	);
	assert.throws(
		() =>
			load(
				base.replace('spell:mana(20)', 'if enabled then spell:mana(20) end'),
			),
		/Conditional spell metadata/,
	);
	assert.throws(
		() => load(`if enabled then ${base} end`),
		/Conditional spell metadata/,
	);
	assert.throws(
		() =>
			load(
				base.replace(
					'spell:cooldown(delay)',
					'if enabled then delay = 3000 end\nspell:cooldown(delay)',
				),
			),
		/literal expression/,
	);
	assert.deepEqual(load(base.replace('exura test', '#####123')), []);
	assert.deepEqual(
		load(
			base.replace(
				'spell:register()',
				'spell:isEnabled(false)\nspell:register()',
			),
		),
		[],
	);
});

void test('spell filters compose, invalid options reset and malformed catalogs are rejected', () => {
	const spells = [
		...load(),
		...load(
			base
				.replace('Healing Touch', 'Other')
				.replace('spell:level(8)', 'spell:level(5)')
				.replace('spell:isPremium(true)', 'spell:isPremium(false)'),
		),
	];
	assert.deepEqual(
		filterSpells(
			spells,
			new URLSearchParams(
				'vocation=Druid&group=Healing&type=Instant&premium=yes',
			),
		).spells.map((spell) => spell.name),
		['Healing Touch'],
	);
	assert.equal(
		filterSpells(spells, new URLSearchParams('sort=level')).spells[0].name,
		'Other',
	);
	assert.equal(
		filterSpells(spells, new URLSearchParams('sort=constructor&type=bad'))
			.filters.sort,
		'name',
	);
	assert.throws(() => parseSpellRecords([spells[0], spells[0]]), /duplicate/);
	assert.throws(
		() => parseSpellRecords([{ ...spells[0], mana: -1 }]),
		/Invalid spell mana/,
	);
});

void test('operator aliases preserve old links without ambiguous or unknown targets', () => {
	const spells = load();
	assert.deepEqual(
		applySpellAliases(spells, { oldhealing: 'Healing Touch' })[0].aliases,
		['oldhealing'],
	);
	assert.throws(
		() => applySpellAliases(spells, { oldhealing: 'Unknown' }),
		/no matching/,
	);
	assert.throws(
		() => applySpellAliases(spells, { '../old': 'Healing Touch' }),
		/Invalid spell aliases/,
	);
	assert.throws(
		() =>
			parseSpellRecords([
				spells[0],
				{ ...spells[0], id: 'other', aliases: [spells[0].id] },
			]),
		/duplicate/,
	);
});
