import type { Expression, Statement } from 'luaparse';

import { type CreatureRecord, parseCreatureRecords } from '$lib/creatures';

import { combatTypes } from './combat';
import { catalogSlug } from './identity';
import { luaLiteral, parseLua, walkLua } from './lua';

type Data = string | number | boolean | null | Data[] | { [key: string]: Data };
const unknown = Symbol('unresolved data');
const fields = new Set([
	'outfit',
	'health',
	'maxHealth',
	'experience',
	'manaCost',
	'raceId',
	'Bestiary',
	'bosstiary',
	'flags',
	'elements',
	'loot',
]);
const enums = {
	...combatTypes,
	RARITY_ARCHFOE: 'Archfoe',
	RARITY_BANE: 'Bane',
	RARITY_NEMESIS: 'Nemesis',
};

function object(value: Data | undefined): { [key: string]: Data } {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		throw new Error('Expected a metadata table');
	return value;
}

/** Read registrations and literal metadata only; server scripts are never run. */
export function importCreatureCatalog(
	files: Map<string, string>,
	items: Map<number, string>,
	resistance = { min: -200, max: 200 },
): CreatureRecord[] {
	if (
		!Number.isSafeInteger(resistance.min) ||
		!Number.isSafeInteger(resistance.max) ||
		resistance.min > resistance.max ||
		resistance.min < -10000 ||
		resistance.max > 10000
	)
		throw new Error('Invalid elemental resistance limits');
	const records: CreatureRecord[] = [];
	for (const [file, source] of files) {
		try {
			records.push(...creatureDefinitions(source, items, resistance));
		} catch (error) {
			throw new Error(
				`${file}: ${error instanceof Error ? error.message : 'Invalid creature data'}`,
			);
		}
	}
	return parseCreatureRecords(records);
}

function creatureDefinitions(
	source: string,
	items: Map<number, string>,
	resistance: { min: number; max: number },
): CreatureRecord[] {
	const records: CreatureRecord[] = [];
	const names = new Map<string, Data | typeof unknown>();
	const types = new Map<string, string>();
	const monsters = new Set<string>();
	const registeredMasks = new Set<string>();
	function value(node: Expression | undefined, depth = 0): Data {
		if (!node || depth > 100)
			throw new Error('Missing or deeply nested metadata');
		if (node.type === 'Identifier') {
			const bound = names.get(node.name);
			if (bound !== undefined && bound !== unknown) return bound;
			if (!names.has(node.name) && Object.hasOwn(enums, node.name))
				return enums[node.name as keyof typeof enums];
			throw new Error(`Unresolved metadata: ${node.name}`);
		}
		if (node.type === 'MemberExpression') {
			const result = object(value(node.base, depth + 1))[node.identifier.name];
			if (result === undefined) throw new Error('Unresolved metadata field');
			return result;
		}
		if (node.type === 'TableConstructorExpression') {
			if (node.fields.every((field) => field.type === 'TableValue'))
				return node.fields.map((field) => value(field.value, depth + 1));
			const result: Record<string, Data> = Object.create(null) as Record<
				string,
				Data
			>;
			for (const field of node.fields) {
				if (field.type !== 'TableKeyString')
					throw new Error('Unsupported metadata table key');
				result[field.key.name] = value(field.value, depth + 1);
			}
			return result;
		}
		if (node.type === 'BinaryExpression' || node.type === 'UnaryExpression') {
			const literals = new Map<string, Expression>();
			for (const [key, item] of names) {
				if (typeof item === 'number')
					literals.set(key, {
						type: 'NumericLiteral',
						value: item,
						raw: '',
					});
			}
			return luaLiteral(node, literals);
		}
		return luaLiteral(node);
	}
	function bind(node: Expression | undefined) {
		try {
			return value(node);
		} catch {
			return unknown;
		}
	}
	function touchesMetadata(node: Expression) {
		let found = false;
		walkLua(node, (child) => {
			if (child.type !== 'Identifier') return;
			if (monsters.has(child.name)) found = true;
			const target = names.get(child.name);
			if (!target || typeof target !== 'object') return;
			for (const name of monsters) {
				const mask = names.get(name);
				if (
					mask &&
					typeof mask === 'object' &&
					!Array.isArray(mask) &&
					Object.values(mask).includes(target)
				)
					found = true;
			}
		});
		return found;
	}
	function metadata(key: string, node: Expression | undefined): Data {
		const wanted =
			key === 'Bestiary'
				? ['Locations']
				: key === 'flags'
					? ['summonable', 'convinceable']
					: null;
		if (!wanted) return value(node);
		if (node?.type !== 'TableConstructorExpression') return value(node);
		const result: Record<string, Data> = Object.create(null) as Record<
			string,
			Data
		>;
		for (const field of node.fields)
			if (field.type === 'TableKeyString' && wanted.includes(field.key.name))
				result[field.key.name] = value(field.value);
		return result;
	}
	function register(name: string, mask: Data) {
		const data = object(mask);
		const flags = object(data.flags);
		const bestiary = data.Bestiary ? object(data.Bestiary) : null;
		const boss = data.bosstiary ? object(data.bosstiary) : null;
		if (!Array.isArray(data.elements))
			throw new Error('Missing creature elements');
		const elements = data.elements.map((entry) => {
			const element = object(entry);
			if (
				typeof element.type !== 'string' ||
				!Number.isSafeInteger(element.percent)
			)
				throw new Error('Invalid creature elements');
			return {
				type: element.type,
				percent: element.percent as number,
			};
		});
		const playerTypes = [
			'Physical',
			'Energy',
			'Earth',
			'Fire',
			'Ice',
			'Holy',
			'Death',
		];
		if (
			!playerTypes.every((type) =>
				elements.some(
					(element) => element.type === type && element.percent === 100,
				),
			)
		)
			for (const element of elements)
				element.percent = Math.min(
					Math.max(element.percent, resistance.min),
					resistance.max,
				);
		const loot: string[] = [];
		if (data.loot !== undefined && !Array.isArray(data.loot))
			throw new Error('Invalid creature loot table');
		for (const entry of (data.loot as Data[] | undefined) ?? []) {
			const item = object(entry);
			if (typeof item.chance !== 'number')
				throw new Error('Missing loot chance');
			if (item.chance <= 0) continue;
			const itemName =
				typeof item.name === 'string'
					? item.name
					: typeof item.id === 'number' &&
						  Number.isSafeInteger(item.id) &&
						  item.id > 0
						? (items.get(item.id) ?? `item #${item.id}`)
						: null;
			if (!itemName) throw new Error(`Unknown loot item: ${String(item.id)}`);
			loot.push(itemName);
		}
		records.push({
			id: catalogSlug(name),
			name,
			outfit: object(data.outfit) as Record<string, number>,
			raceId: (data.raceId as number | undefined) ?? null,
			health: (data.maxHealth ?? data.health) as number,
			experience: data.experience as number,
			manaCost: (data.manaCost as number | undefined) ?? 0,
			summonable: flags.summonable as boolean,
			convinceable: flags.convinceable as boolean,
			bestiary: Boolean(bestiary),
			locations: (bestiary?.Locations as string | undefined) ?? '',
			bossCategory: (boss?.bossRace as CreatureRecord['bossCategory']) ?? null,
			bossRaceId: (boss?.bossRaceId as number | undefined) ?? null,
			elements,
			loot: [...new Set(loot)],
		});
	}
	function inspect(statement: Statement) {
		if (
			statement.type === 'LocalStatement' ||
			statement.type === 'AssignmentStatement'
		) {
			const bound = statement.init.map(bind);
			for (let i = 0; i < statement.variables.length; i++) {
				const variable = statement.variables[i],
					init = statement.init[i];
				if (variable.type === 'Identifier') {
					if (monsters.has(variable.name) || types.has(variable.name))
						throw new Error(
							'Reassigned monster declaration requires an explicit export',
						);
					names.set(variable.name, bound[i] ?? null);
					if (
						init?.type === 'TableConstructorExpression' &&
						!init.fields.length
					) {
						names.set(
							variable.name,
							Object.create(null) as Record<string, Data>,
						);
					}
					if (
						init?.type === 'CallExpression' &&
						init.base.type === 'MemberExpression' &&
						init.base.base.type === 'Identifier' &&
						init.base.base.name === 'Game' &&
						init.base.identifier.name === 'createMonsterType'
					) {
						const name = value(init.arguments[0]);
						if (typeof name !== 'string')
							throw new Error('Invalid creature name');
						types.set(variable.name, name);
					}
				} else if (
					variable.type === 'MemberExpression' &&
					variable.base.type === 'Identifier' &&
					fields.has(variable.identifier.name)
				) {
					const target = names.get(variable.base.name);
					if (target === undefined || target === unknown)
						throw new Error('Unresolved monster metadata table');
					monsters.add(variable.base.name);
					object(target)[variable.identifier.name] = metadata(
						variable.identifier.name,
						init,
					);
				} else if (
					variable.type === 'IndexExpression' ||
					(variable.type === 'MemberExpression' &&
						variable.base.type !== 'Identifier')
				) {
					if (touchesMetadata(variable))
						throw new Error(
							'Nested monster metadata requires an explicit export',
						);
				} else if (
					variable.type === 'MemberExpression' &&
					variable.base.type === 'Identifier' &&
					!monsters.has(variable.base.name) &&
					touchesMetadata(variable.base)
				) {
					throw new Error(
						'Aliased monster metadata requires an explicit export',
					);
				}
			}
		} else if (
			statement.type === 'CallStatement' &&
			statement.expression.type === 'CallExpression'
		) {
			const call = statement.expression;
			if (
				call.base.type === 'MemberExpression' &&
				call.base.base.type === 'Identifier' &&
				types.has(call.base.base.name) &&
				call.base.identifier.name === 'register'
			) {
				register(types.get(call.base.base.name)!, value(call.arguments[0]));
				if (call.arguments[0]?.type === 'Identifier')
					registeredMasks.add(call.arguments[0].name);
			} else
				for (const arg of call.arguments) {
					if (arg.type !== 'Identifier' && touchesMetadata(arg))
						throw new Error(
							'Dynamic monster metadata requires an explicit export',
						);
					if (arg.type !== 'Identifier' || !monsters.has(arg.name)) continue;
					if (!registeredMasks.has(arg.name))
						throw new Error(
							'Dynamic monster metadata requires an explicit export',
						);
					// Registration copies metadata. Later helpers cannot be used as a second literal registration.
					names.set(arg.name, unknown);
				}
		} else if (statement.type !== 'FunctionDeclaration') {
			walkLua(statement, (node) => {
				if (
					node.type === 'MemberExpression' &&
					(fields.has(node.identifier.name) ||
						node.identifier.name === 'createMonsterType' ||
						node.identifier.name === 'register')
				)
					throw new Error(
						'Conditional monster metadata requires an explicit export',
					);
			});
		}
	}
	for (const statement of parseLua(source).body) inspect(statement);
	return records;
}

export function readItemNames(xml: string): Map<number, string> {
	const names = new Map<number, string>();
	for (const match of xml
		.replace(/<!--[\s\S]*?-->/g, '')
		.matchAll(/<item\b([^>]*)>/g)) {
		const attrs = Object.fromEntries(
			[...match[1].matchAll(/([a-z]+)\s*=\s*(["'])(.*?)\2/gi)].map((attr) => [
				attr[1],
				attr[3],
			]),
		);
		if (!attrs.name) continue;
		const from = Number(attrs.id ?? attrs.fromid),
			to = Number(attrs.id ?? attrs.toid);
		if (
			!Number.isSafeInteger(from) ||
			!Number.isSafeInteger(to) ||
			from < 1 ||
			to < from ||
			to > 1000000
		)
			throw new Error('Invalid item range');
		const name = attrs.name.replace(
			/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi,
			(_, entity: string) => {
				if (entity.startsWith('#'))
					return String.fromCodePoint(
						entity[1] === 'x'
							? parseInt(entity.slice(2), 16)
							: Number(entity.slice(1)),
					);
				return (
					{ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' } as Record<
						string,
						string
					>
				)[entity];
			},
		);
		for (let id = from; id <= to; id++) names.set(id, name);
	}
	return names;
}
