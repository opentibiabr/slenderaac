import type { CallExpression, Expression, Statement } from 'luaparse';

import type { SpellRecord } from '$lib/spells';
import { parseSpellRecords, spellSlug } from '$lib/spells';

import { literalExpression, luaLiteral, parseLua, walkLua } from './lua';

type Declaration = {
	source?: string;
	constants: Map<string, Expression>;
	kind: string;
	values: Map<string, Expression[]>;
	conjuredItem: number | null;
	conjuredAmount: number;
	variableMana: boolean;
	magicTypes: Set<string>;
};

const fields = new Set([
	'name',
	'words',
	'vocation',
	'group',
	'level',
	'mana',
	'manaPercent',
	'soul',
	'cooldown',
	'groupCooldown',
	'isPremium',
	'needLearn',
	'hasParams',
	'isEnabled',
	'runeId',
	'magicLevel',
	'charges',
]);

export function spellDeclarations(source: string): Declaration[] {
	const magicTypes = new Set<string>();
	const constants = new Map<string, Expression>();
	const variables = new Map<string, Declaration>();
	const registered: Declaration[] = [];
	function bind(expression: Expression | undefined): Expression {
		if (!expression) return { type: 'NilLiteral', value: null, raw: '' };
		try {
			return literalExpression(expression, constants);
		} catch {
			return { type: 'Identifier', name: '__dynamic_data_expression' };
		}
	}
	function call(node: CallExpression) {
		if (
			node.base.type !== 'MemberExpression' ||
			node.base.base.type !== 'Identifier'
		)
			return;
		const spell = variables.get(node.base.base.name);
		const method = node.base.identifier.name;
		if (
			method === 'setParameter' &&
			node.arguments[0]?.type === 'Identifier' &&
			node.arguments[0].name === 'COMBAT_PARAM_TYPE' &&
			node.arguments[1]?.type === 'Identifier'
		) {
			const combatTypes: Record<string, string> = {
				COMBAT_HEALING: 'Healing',
				COMBAT_PHYSICALDAMAGE: 'Physical',
				COMBAT_ENERGYDAMAGE: 'Energy',
				COMBAT_EARTHDAMAGE: 'Earth',
				COMBAT_FIREDAMAGE: 'Fire',
				COMBAT_ICEDAMAGE: 'Ice',
				COMBAT_HOLYDAMAGE: 'Holy',
				COMBAT_DEATHDAMAGE: 'Death',
				COMBAT_LIFEDRAIN: 'Life Drain',
				COMBAT_MANADRAIN: 'Mana Drain',
				COMBAT_DROWNDAMAGE: 'Drowning',
			};
			const type = combatTypes[node.arguments[1].name];
			if (type) magicTypes.add(type);
		}
		if (!spell) return;
		if (method === 'register')
			registered.push({
				...spell,
				constants: new Map(constants),
				values: new Map(spell.values),
			});
		else if (fields.has(method))
			spell.values.set(
				method,
				node.arguments.map((argument) =>
					literalExpression(argument, constants),
				),
			);
	}
	function statements(body: Statement[], scoped = false) {
		const outerConstants = new Map(constants);
		const outerVariables = new Map(variables);
		const locals = new Set<string>();
		for (const node of body) {
			if (node.type === 'LocalStatement') {
				const bound = node.variables.map((_, i) => bind(node.init[i]));
				for (let i = 0; i < node.variables.length; i++) {
					const init = node.init[i];
					locals.add(node.variables[i].name);
					constants.set(node.variables[i].name, bound[i]);
					variables.delete(node.variables[i].name);
					if (
						init?.type === 'CallExpression' &&
						init.base.type === 'Identifier' &&
						init.base.name === 'Spell'
					) {
						const arg = init.arguments[0];
						const kind =
							arg?.type === 'Identifier'
								? arg.name.replace('SPELL_', '').toLowerCase()
								: luaLiteral(arg);
						if (kind !== 'instant' && kind !== 'rune')
							throw new Error('Unknown spell kind');
						variables.set(node.variables[i].name, {
							kind,
							constants,
							values: new Map(),
							conjuredItem: null,
							conjuredAmount: 0,
							variableMana: false,
							magicTypes,
						});
					}
				}
			} else if (
				node.type === 'AssignmentStatement' &&
				node.variables.every((variable) => variable.type === 'Identifier')
			) {
				const bound = node.variables.map((_, i) => bind(node.init[i]));
				for (let i = 0; i < node.variables.length; i++) {
					const variable = node.variables[i];
					if (variable.type !== 'Identifier') continue;
					if (variables.has(variable.name))
						throw new Error(
							'Reassigned spell declaration requires an explicit export',
						);
					constants.set(variable.name, bound[i]);
				}
			} else if (
				node.type === 'CallStatement' &&
				node.expression.type === 'CallExpression'
			)
				call(node.expression);
			else if (
				node.type === 'FunctionDeclaration' &&
				node.identifier?.type === 'MemberExpression' &&
				node.identifier.base.type === 'Identifier'
			) {
				const spell = variables.get(node.identifier.base.name);
				if (!spell || node.identifier.identifier.name !== 'onCastSpell')
					continue;
				walkLua(node, (child) => {
					if (
						child.type !== 'CallExpression' ||
						child.base.type !== 'MemberExpression'
					)
						return;
					const method = child.base.identifier.name;
					if (method === 'conjureItem') {
						const item = luaLiteral(child.arguments[1], constants);
						if (typeof item !== 'number')
							throw new Error('Dynamic conjured item');
						spell.conjuredItem = item;
						const amount = luaLiteral(child.arguments[2], constants);
						if (
							typeof amount !== 'number' ||
							!Number.isSafeInteger(amount) ||
							amount < 1
						)
							throw new Error('Invalid conjured amount');
						spell.conjuredAmount = amount;
					}
					if (method === 'addMana' || method === 'removeMana')
						spell.variableMana = true;
				});
			} else if (node.type === 'DoStatement') statements(node.body, true);
			else if (node.type !== 'FunctionDeclaration') {
				walkLua(node, (child) => {
					if (child.type === 'AssignmentStatement')
						for (const variable of child.variables) {
							if (
								variable.type === 'Identifier' &&
								constants.has(variable.name)
							)
								constants.set(variable.name, {
									type: 'Identifier',
									name: '__dynamic_data_expression',
								});
						}
					if (
						child.type === 'CallExpression' &&
						child.base.type === 'Identifier' &&
						child.base.name === 'Spell'
					)
						throw new Error(
							'Conditional spell metadata needs an explicit export',
						);
					if (
						child.type === 'CallExpression' &&
						child.base.type === 'MemberExpression' &&
						child.base.base.type === 'Identifier' &&
						variables.has(child.base.base.name) &&
						(fields.has(child.base.identifier.name) ||
							child.base.identifier.name === 'register')
					)
						throw new Error(
							'Conditional spell metadata needs an explicit export',
						);
				});
			}
		}
		if (scoped)
			for (const name of locals) {
				const constant = outerConstants.get(name);
				const variable = outerVariables.get(name);
				if (constant) constants.set(name, constant);
				else constants.delete(name);
				if (variable) variables.set(name, variable);
				else variables.delete(name);
			}
	}
	statements(parseLua(source).body);
	return registered;
}

function property(spell: Declaration, name: string, index = 0) {
	const expression = spell.values.get(name)?.[index];
	try {
		return expression ? luaLiteral(expression, spell.constants) : undefined;
	} catch (error) {
		throw new Error(
			`${spell.source ?? 'Spell'}: ${name}: ${error instanceof Error ? error.message : 'Invalid property'}`,
		);
	}
}

function number(
	spell: Declaration,
	name: string,
	fallback = 0,
	index = 0,
): number {
	const value = property(spell, name, index) ?? fallback;
	if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0)
		throw new Error(`Invalid numeric spell ${name}`);
	return value;
}

function text(
	spell: Declaration,
	name: string,
	fallback = '',
	index = 0,
): string {
	const value = property(spell, name, index) ?? fallback;
	if (typeof value !== 'string') throw new Error(`Invalid text spell ${name}`);
	return value;
}

function flag(spell: Declaration, name: string, fallback = false): boolean {
	const value = property(spell, name) ?? fallback;
	if (typeof value !== 'boolean')
		throw new Error(`Invalid boolean spell ${name}`);
	return value;
}

export function importSpellCatalog(
	files: Map<string, string>,
	vocations: Map<string, string>,
): SpellRecord[] {
	const declarations = [...files].flatMap(([file, source]) => {
		try {
			return spellDeclarations(source).map((spell) => ({
				...spell,
				source: file,
			}));
		} catch (error) {
			throw new Error(
				`${file}: ${error instanceof Error ? error.message : 'Invalid source'}`,
			);
		}
	});
	const runes = new Map(
		declarations
			.filter((spell) => spell.kind === 'rune')
			.map((spell) => [number(spell, 'runeId'), spell]),
	);
	const result = declarations
		.filter(
			(spell) =>
				spell.kind === 'instant' &&
				flag(spell, 'isEnabled', true) &&
				!text(spell, 'words').startsWith('#'),
		)
		.map((spell) => {
			const name = text(spell, 'name');
			const rune = spell.conjuredItem
				? runes.get(spell.conjuredItem)
				: undefined;
			const vocationNames = (definition: Declaration) =>
				[
					...new Set(
						(definition.values.get('vocation') ?? []).map((node) => {
							const value = luaLiteral(node, definition.constants);
							if (typeof value !== 'string')
								throw new Error('Invalid vocation');
							const name = value.split(';')[0].toLowerCase();
							const base = vocations.get(name);
							if (!base) throw new Error(`Unknown vocation ${name}`);
							return base;
						}),
					),
				].sort();
			const title = (value: string) =>
				value ? value[0].toUpperCase() + value.slice(1).toLowerCase() : '';
			return {
				id: spellSlug(name),
				name,
				words: text(spell, 'words'),
				vocations: vocationNames(spell),
				group: title(text(spell, 'group', 'none')),
				magicType: [...spell.magicTypes].join(', '),
				secondaryGroup: title(text(spell, 'group', '', 1)),
				type: rune ? 'Rune' : 'Instant',
				level: number(spell, 'level'),
				mana: number(spell, 'mana'),
				manaPercent: number(spell, 'manaPercent'),
				variableMana: spell.variableMana,
				soul: number(spell, 'soul'),
				amount: spell.conjuredAmount,
				cooldown: number(spell, 'cooldown', 1000),
				groupCooldown: number(spell, 'groupCooldown', 1000),
				secondaryCooldown: number(spell, 'groupCooldown', 0, 1),
				premium: flag(spell, 'isPremium'),
				learnable: flag(spell, 'needLearn'),
				hasParams: flag(spell, 'hasParams'),
				rune: rune
					? {
							itemId: number(rune, 'runeId'),
							group: title(text(rune, 'group', 'none')),
							magicType: [...rune.magicTypes].join(', '),
							vocations: vocationNames(rune),
							level: number(rune, 'level'),
							magicLevel: number(rune, 'magicLevel'),
							charges: number(rune, 'charges'),
						}
					: null,
			};
		});
	return parseSpellRecords(result).sort((a, b) =>
		a.name.localeCompare(b.name, 'en'),
	);
}
