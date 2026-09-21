import type { Expression, Node, Statement } from 'luaparse';

import { parseAchievementRecords } from '$lib/achievements';

import { literalExpression, luaLiteral, parseLua } from './lua';

function member(node: Node, base: string): string | null {
	return node.type === 'MemberExpression' &&
		node.indexer === '.' &&
		node.base.type === 'Identifier' &&
		node.base.name === base
		? node.identifier.name
		: null;
}

function validateRegistration(
	body: Statement[],
	identity: string,
	entry: string,
) {
	const defaults = new Map<string, string>();
	let registered = false;
	let hasGuard = false;
	let hasLabel = false;
	const argumentField = (node: Expression) =>
		node.type === 'Identifier'
			? node.name === identity
				? 'id'
				: defaults.get(node.name)
			: member(node, entry);
	function diagnosticValue(node: Expression): boolean {
		if (
			[
				'StringLiteral',
				'NumericLiteral',
				'BooleanLiteral',
				'NilLiteral',
			].includes(node.type)
		)
			return true;
		if (node.type === 'Identifier')
			return node.name === identity || defaults.has(node.name);
		if (member(node, entry)) return true;
		return (
			node.type === 'CallExpression' &&
			member(node.base, 'string') === 'format' &&
			node.arguments.every(diagnosticValue)
		);
	}
	function diagnostic(statement: Statement): boolean {
		if (
			statement.type !== 'CallStatement' ||
			statement.expression.type !== 'CallExpression'
		)
			return false;
		const call = statement.expression;
		return (
			['error', 'trace'].includes(member(call.base, 'logger') ?? '') &&
			call.arguments.every(diagnosticValue)
		);
	}
	for (const [index, statement] of body.entries()) {
		if (diagnostic(statement)) continue;
		if (
			statement.type === 'IfStatement' &&
			!registered &&
			statement.clauses.length === 1
		) {
			const clause = statement.clauses[0];
			const condition = clause.type === 'IfClause' ? clause.condition : null;
			if (
				!condition ||
				condition.type !== 'BinaryExpression' ||
				condition.operator !== '==' ||
				!['name', 'description'].includes(
					member(condition.left, entry) ?? '',
				) ||
				condition.right.type !== 'NilLiteral' ||
				clause.body.at(-1)?.type !== 'GotoStatement' ||
				!clause.body.every((item, i) =>
					i === clause.body.length - 1
						? item.type === 'GotoStatement' && item.label.name === 'continue'
						: diagnostic(item),
				)
			)
				throw new Error('Unsupported achievement registration guard');
			// Validated records always have both fields, so this guard never skips one.
			hasGuard = true;
			continue;
		}
		if (statement.type === 'LocalStatement' && !registered) {
			const expression = statement.init[0];
			const name = statement.variables[0]?.name;
			if (
				statement.variables.length !== 1 ||
				statement.init.length !== 1 ||
				!name ||
				[identity, entry, 'Game', 'logger', 'string'].includes(name) ||
				defaults.has(name) ||
				expression.type !== 'LogicalExpression' ||
				expression.operator !== 'or'
			)
				throw new Error('Unsupported achievement registration default');
			const key = member(expression.left, entry);
			if (
				!key ||
				!['secret', 'grade', 'points'].includes(key) ||
				luaLiteral(expression.right) !== (key === 'secret' ? false : 0)
			)
				throw new Error('Unsupported achievement registration default');
			defaults.set(name, key);
			continue;
		}
		if (
			statement.type === 'CallStatement' &&
			statement.expression.type === 'CallExpression' &&
			member(statement.expression.base, 'Game') === 'registerAchievement' &&
			!registered
		) {
			if (
				statement.expression.arguments.map(argumentField).join(',') !==
				'id,name,description,secret,grade,points'
			)
				throw new Error('Unsupported achievement registration arguments');
			registered = true;
			continue;
		}
		if (
			statement.type === 'LabelStatement' &&
			statement.label.name === 'continue' &&
			index === body.length - 1
		) {
			hasLabel = true;
			continue;
		}
		throw new Error(
			'Runtime achievement mutations or control flow require an explicit export',
		);
	}
	if (!registered || (hasGuard && !hasLabel))
		throw new Error('Achievement registration is missing or ambiguous');
}

/** Read literal definitions and their registration without executing server scripts. */
export function importAchievementCatalog(source: string) {
	const program = parseLua(source);
	const names = new Map<string, Expression>();
	let records: ReturnType<typeof parseAchievementRecords> | null = null;
	let registered = false;
	for (const statement of program.body) {
		if (
			statement.type === 'AssignmentStatement' &&
			records &&
			!registered &&
			statement.variables.length === 1 &&
			statement.variables[0].type === 'Identifier' &&
			['ACHIEVEMENT_FIRST', 'ACHIEVEMENT_LAST'].includes(
				statement.variables[0].name,
			) &&
			statement.init.length === 1
		) {
			const value = statement.init[0];
			if (
				value.type === 'UnaryExpression' &&
				value.operator === '#' &&
				value.argument.type === 'Identifier' &&
				value.argument.name === 'ACHIEVEMENTS'
			)
				continue;
			if (typeof luaLiteral(value, names) === 'number') continue;
		}
		if (statement.type === 'FunctionDeclaration' && registered) {
			let target: Node | null = statement.identifier;
			while (target?.type === 'MemberExpression') target = target.base;
			if (target?.type === 'Identifier' && target.name !== 'ACHIEVEMENTS')
				continue;
		}
		if (
			statement.type === 'AssignmentStatement' &&
			statement.variables.length === 1 &&
			statement.variables[0].type === 'Identifier' &&
			statement.variables[0].name === 'ACHIEVEMENTS'
		) {
			if (
				records ||
				statement.init.length !== 1 ||
				statement.init[0].type !== 'TableConstructorExpression'
			)
				throw new Error('Achievement definitions require one literal table');
			const rows = statement.init[0].fields.map((field) => {
				if (
					field.type !== 'TableKey' ||
					field.value.type !== 'TableConstructorExpression'
				)
					throw new Error(
						'Achievement entries require explicit numeric identities',
					);
				const row: Record<string, unknown> = {
					id: luaLiteral(field.key, names),
					secret: false,
				};
				const keys = new Set<string>();
				for (const property of field.value.fields) {
					if (
						property.type !== 'TableKeyString' ||
						!['name', 'description', 'grade', 'points', 'secret'].includes(
							property.key.name,
						) ||
						keys.has(property.key.name)
					)
						throw new Error('Unsupported or duplicate achievement property');
					keys.add(property.key.name);
					row[property.key.name] = luaLiteral(property.value, names);
				}
				return row;
			});
			records = parseAchievementRecords(rows);
			continue;
		}
		if (statement.type === 'LocalStatement' && !records) {
			if (statement.init.length !== statement.variables.length)
				throw new Error('Unsupported achievement constant initialization');
			for (let index = 0; index < statement.variables.length; index++) {
				const variable = statement.variables[index];
				if (
					['ACHIEVEMENTS', 'Game', 'pairs', 'logger', 'string'].includes(
						variable.name,
					) ||
					!statement.init[index] ||
					names.has(variable.name)
				)
					throw new Error('Unsupported achievement constant');
				names.set(
					variable.name,
					literalExpression(statement.init[index], names),
				);
			}
			continue;
		}
		if (
			statement.type === 'ForGenericStatement' &&
			records &&
			!registered &&
			statement.variables.length === 2 &&
			statement.iterators.length === 1 &&
			statement.iterators[0].type === 'CallExpression' &&
			statement.iterators[0].base.type === 'Identifier' &&
			statement.iterators[0].base.name === 'pairs' &&
			statement.iterators[0].arguments.length === 1 &&
			statement.iterators[0].arguments[0].type === 'Identifier' &&
			statement.iterators[0].arguments[0].name === 'ACHIEVEMENTS'
		) {
			const [identity, entry] = statement.variables.map(
				(variable) => variable.name,
			);
			if (
				identity === entry ||
				[identity, entry].some((name) =>
					['Game', 'logger', 'string'].includes(name),
				)
			)
				throw new Error('Unsupported achievement registration variables');
			validateRegistration(statement.body, identity, entry);
			registered = true;
			continue;
		}
		throw new Error(
			'Runtime achievement definitions require an explicit export',
		);
	}
	if (!records?.length || !registered)
		throw new Error('Achievement catalog or registration is missing');
	return records;
}
