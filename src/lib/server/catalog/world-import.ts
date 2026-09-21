import { parseWorldConfig } from '$lib/worlds';

import { luaLiteral, parseLua, walkLua } from './lua';

export function importWorldConfig(source: string) {
	const fields = new Map([
		['serverName', 'name'],
		['location', 'location'],
		['worldType', 'pvpType'],
		['maxPlayers', 'maxPlayers'],
	]);
	const world: Record<string, unknown> = {};
	const ast = parseLua(source);
	const topLevel = new Set(ast.body);
	walkLua(ast, (node) => {
		if (node.type !== 'AssignmentStatement') return;
		if (
			node.variables.some(
				(variable) =>
					variable.type === 'Identifier' && fields.has(variable.name),
			) &&
			!topLevel.has(node)
		)
			throw new Error(
				'World settings require unconditional literal assignments',
			);
	});
	for (const statement of ast.body) {
		if (statement.type !== 'AssignmentStatement') continue;
		for (const [index, variable] of statement.variables.entries()) {
			if (variable.type !== 'Identifier') continue;
			const field = fields.get(variable.name);
			if (field) world[field] = luaLiteral(statement.init[index]);
		}
	}
	return parseWorldConfig(world);
}
