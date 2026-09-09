import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';

import { readServerFiles, readVocations } from './source';

const execute = promisify(execFile);

void test('server files are read from the selected revision without switching or changing checkout data', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'slender-catalog-'));
	try {
		await fs.mkdir(path.join(root, 'data/monster'), { recursive: true });
		await fs.writeFile(
			path.join(root, 'data/spell.lua'),
			'local name = "before"',
		);
		await fs.writeFile(path.join(root, 'data/#disabled.lua'), 'disabled');
		await fs.writeFile(path.join(root, 'data/monster/spell.lua'), 'internal');
		const git = (args: string[]) => execute('git', args, { cwd: root });
		await git(['init', '--quiet']);
		await git(['add', 'data']);
		await git([
			'-c',
			'user.name=Catalog Test',
			'-c',
			'user.email=catalog@example.invalid',
			'-c',
			'commit.gpgsign=false',
			'commit',
			'--quiet',
			'-m',
			'fixture',
		]);
		await fs.writeFile(
			path.join(root, 'data/spell.lua'),
			'local name = "after"',
		);
		const { files, revision } = await readServerFiles(root, ['data'], 'HEAD');
		assert.equal(files.size, 1);
		assert.equal(files.get('data/spell.lua'), 'local name = "before"');
		assert.match(revision!, /^[a-f0-9]{40}$/);
		assert.equal(
			(await readServerFiles(root, ['data'])).files.get('data/spell.lua'),
			'local name = "after"',
		);
		await assert.rejects(
			readServerFiles(root, ['../escape']),
			/Invalid data directory/,
		);
		await assert.rejects(readServerFiles(root, ['data'], 'missing-revision'));
	} finally {
		assert.ok(path.relative(os.tmpdir(), root).startsWith('slender-catalog-'));
		await fs.rm(root, { recursive: true, force: true });
	}
});

void test('vocation promotions resolve against the server definitions and missing bases reject import', () => {
	const xml =
		'<vocations><vocation id="1" name="Mage" baseid="1"/><vocation id="2" name="Master Mage" baseid="1"/></vocations>';
	assert.deepEqual(
		[...readVocations(xml)],
		[
			['mage', 'Mage'],
			['master mage', 'Mage'],
		],
	);
	assert.throws(
		() => readVocations(xml.replace('baseid="1"/>', 'baseid="9"/>')),
		/no base definition/,
	);
});

void test('an empty or malformed import leaves the installed server catalog unchanged', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'slender-catalog-'));
	try {
		await fs.mkdir(path.join(root, 'data/XML'), { recursive: true });
		await fs.writeFile(
			path.join(root, 'data/XML/vocations.xml'),
			'<vocations><vocation id="1" name="Mage" baseid="1"/></vocations>',
		);
		const output = path.join(root, 'library.json');
		await fs.writeFile(output, 'previous catalog');
		const args = [
			path.resolve('src/scripts/import-server-data.ts'),
			'--server-dir',
			root,
			'--datapack',
			'data-custom',
			'--output',
			output,
		];
		await assert.rejects(execute(process.execPath, args), /empty catalog/);
		assert.equal(await fs.readFile(output, 'utf8'), 'previous catalog');
		await fs.mkdir(path.join(root, 'data/scripts/spells'), { recursive: true });
		await fs.writeFile(
			path.join(root, 'data/scripts/spells/broken.lua'),
			'local spell = Spell("instant")\nspell:mana(dynamicValue)\nspell:register()',
		);
		await assert.rejects(execute(process.execPath, args), /literal expression/);
		assert.equal(await fs.readFile(output, 'utf8'), 'previous catalog');
		assert.equal(
			(await fs.readdir(root)).filter((name) => name.endsWith('.tmp')).length,
			0,
		);
	} finally {
		assert.ok(path.relative(os.tmpdir(), root).startsWith('slender-catalog-'));
		await fs.rm(root, { recursive: true, force: true });
	}
});
