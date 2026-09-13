import type { Expression, Node } from 'luaparse';
import { parse } from 'luaparse';

export function literalExpression(
	node: Expression,
	names: Map<string, Expression>,
): Expression {
	const value = luaLiteral(node, names);
	if (typeof value === 'string')
		return {
			type: 'StringLiteral',
			value: Buffer.from(value).toString('latin1'),
			raw: '',
		};
	if (typeof value === 'number')
		return { type: 'NumericLiteral', value, raw: '' };
	if (typeof value === 'boolean')
		return { type: 'BooleanLiteral', value, raw: '' };
	return { type: 'NilLiteral', value: null, raw: '' };
}

export function parseLua(source: string) {
	// Parse UTF-8 as bytes so escaped and literal strings share the same decoding.
	return parse(Buffer.from(source).toString('latin1'), {
		luaVersion: '5.3',
		encodingMode: 'pseudo-latin1',
		comments: false,
	});
}

export function luaLiteral(
	node: Expression | undefined,
	names = new Map<string, Expression>(),
	depth = 0,
): string | number | boolean | null {
	if (!node) throw new Error('Missing data expression');
	if (depth > 100) throw new Error('Data expression is too deeply nested');
	const valueOf = (expression: Expression) =>
		luaLiteral(expression, names, depth + 1);
	if (node.type === 'Identifier' && names.has(node.name))
		return valueOf(names.get(node.name)!);
	if (node.type === 'StringLiteral')
		return Buffer.from(node.value, 'latin1').toString('utf8');
	if (
		node.type === 'NumericLiteral' ||
		node.type === 'BooleanLiteral' ||
		node.type === 'NilLiteral'
	)
		return node.value;
	if (node.type === 'UnaryExpression' && node.operator === '-') {
		const value = valueOf(node.argument);
		if (typeof value === 'number') return -value;
	}
	if (node.type === 'BinaryExpression') {
		const left = valueOf(node.left);
		const right = valueOf(node.right);
		if (
			node.operator === '..' &&
			typeof left === 'string' &&
			typeof right === 'string'
		)
			return left + right;
		if (typeof left === 'number' && typeof right === 'number') {
			if (node.operator === '+') return left + right;
			if (node.operator === '-') return left - right;
			if (node.operator === '*') return left * right;
			if (node.operator === '/' && right !== 0) return left / right;
		}
	}
	throw new Error(`Data requires a literal expression, received ${node.type}`);
}

/** Inspect syntax only. Never evaluate function calls or execute source scripts. */
export function walkLua(node: Node, visit: (node: Node) => void): void {
	visit(node);
	for (const value of Object.values(node)) {
		if (Array.isArray(value)) {
			for (const child of value as unknown[])
				if (isNode(child)) walkLua(child, visit);
		} else if (isNode(value)) walkLua(value, visit);
	}
}

function isNode(value: unknown): value is Node {
	return (
		typeof value === 'object' &&
		value !== null &&
		'type' in value &&
		typeof value.type === 'string'
	);
}
