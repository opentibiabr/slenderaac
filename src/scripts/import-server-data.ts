import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import {
	applyCreatureAliases,
	applySpellAliases,
} from '$lib/server/catalog/aliases';
import {
	importCreatureCatalog,
	readItemNames,
} from '$lib/server/catalog/creature-import';
import { luaLiteral, parseLua } from '$lib/server/catalog/lua';
import { readServerFiles, readVocations } from '$lib/server/catalog/source';
import { importSpellCatalog } from '$lib/server/catalog/spell-import';

const { values } = parseArgs({
	options: {
		'server-dir': { type: 'string' },
		ref: { type: 'string' },
		datapack: { type: 'string' },
		output: { type: 'string' },
		'spell-aliases': { type: 'string' },
		'creature-aliases': { type: 'string' },
	},
});

async function main() {
	if (!values['server-dir'] || !values.output)
		throw new Error(
			'Usage: bun src/scripts/import-server-data.ts --server-dir <server> --output <library.json> [--ref <branch>] [--datapack <directory>]',
		);
	const root = await fs.realpath(values['server-dir']);
	let datapack = values.datapack;
	const resistance = { min: -200, max: 200 };
	try {
		const config = parseLua(
			await fs.readFile(path.join(root, 'config.lua'), 'utf8'),
		);
		for (const statement of config.body) {
			if (statement.type !== 'AssignmentStatement') continue;
			const index = statement.variables.findIndex(
				(variable) =>
					variable.type === 'Identifier' &&
					variable.name === 'dataPackDirectory',
			);
			if (index >= 0 && !values.datapack) {
				const value = luaLiteral(statement.init[index]);
				if (typeof value === 'string') datapack = value;
			}
			for (const [key, configKey] of [
				['min', 'minElementalResistance'],
				['max', 'maxElementalResistance'],
			] as const) {
				const position = statement.variables.findIndex(
					(variable) =>
						variable.type === 'Identifier' && variable.name === configKey,
				);
				if (position >= 0) {
					const limit = luaLiteral(statement.init[position]);
					if (typeof limit !== 'number')
						throw new Error('Invalid elemental resistance limit');
					resistance[key] = limit;
				}
			}
		}
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT' || !datapack)
			throw error;
	}
	if (!datapack || !/^[a-zA-Z0-9_-]+$/.test(datapack))
		throw new Error('Set a valid dataPackDirectory or pass --datapack');
	const { files, revision } = await readServerFiles(
		root,
		[
			'data/XML/vocations.xml',
			'data/items/items.xml',
			'data/monster',
			`${datapack}/monster`,
			'data/scripts/spells',
			'data/scripts/runes',
			`${datapack}/scripts/spells`,
			`${datapack}/scripts/runes`,
		],
		values.ref,
	);
	const xml = files.get('data/XML/vocations.xml');
	if (!xml) throw new Error('Vocation definitions are missing');
	let spells = importSpellCatalog(
		new Map(
			[...files].filter(
				([name]) =>
					/\/scripts\/(spells|runes)\//.test(name) &&
					name.endsWith('.lua') &&
					!name.split('/').includes('monster'),
			),
		),
		readVocations(xml),
	);
	if (values['spell-aliases']) {
		const file = await fs.stat(values['spell-aliases']);
		if (!file.isFile() || file.size > 1_000_000)
			throw new Error('Invalid spell alias file');
		spells = applySpellAliases(
			spells,
			JSON.parse(await fs.readFile(values['spell-aliases'], 'utf8')),
		);
	}
	if (!spells.length)
		throw new Error('Refusing to replace the library with an empty catalog');
	let creatures = importCreatureCatalog(
		new Map(
			[...files].filter(
				([name]) =>
					/^(data|[^/]+)\/monster\//.test(name) && name.endsWith('.lua'),
			),
		),
		readItemNames(files.get('data/items/items.xml') ?? ''),
		resistance,
	);
	if (values['creature-aliases']) {
		const file = await fs.stat(values['creature-aliases']);
		if (!file.isFile() || file.size > 1_000_000)
			throw new Error('Invalid creature alias file');
		creatures = applyCreatureAliases(
			creatures,
			JSON.parse(await fs.readFile(values['creature-aliases'], 'utf8')),
		);
	}
	if (!creatures.length)
		throw new Error(
			'Refusing to replace the library with an empty creature catalog',
		);
	const output = path.resolve(values.output);
	await fs.mkdir(path.dirname(output), { recursive: true });
	const temporary = `${output}.${process.pid}.tmp`;
	try {
		await fs.writeFile(
			temporary,
			JSON.stringify(
				{
					schemaVersion: 1,
					importedAt: new Date().toISOString(),
					revision,
					spells,
					creatures,
				},
				null,
				2,
			),
			{ flag: 'wx' },
		);
		await fs.rename(temporary, output);
	} finally {
		await fs.rm(temporary, { force: true });
	}
	console.log(
		JSON.stringify({
			status: 'imported',
			spells: spells.length,
			runes: spells.filter((spell) => spell.type === 'Rune').length,
			creatures: creatures.length,
			bestiary: creatures.filter((creature) => creature.bestiary).length,
			boostableBosses: creatures.filter(
				(creature) => creature.bossCategory === 'Archfoe',
			).length,
			revision,
		}),
	);
}

void main().catch((error) => {
	console.error(error instanceof Error ? error.message : 'Import failed');
	process.exitCode = 1;
});
