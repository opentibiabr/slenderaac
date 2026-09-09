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
		assert.equal(files.size, 2);
		assert.equal(files.get('data/monster/spell.lua'), 'internal');
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
		await fs.writeFile(
			path.join(root, 'data/scripts/spells/broken.lua'),
			'local spell = Spell("instant")\nspell:name("Healing")\nspell:words("exura")\nspell:vocation("Mage;true")\nspell:register()',
		);
		await assert.rejects(
			execute(process.execPath, args),
			/empty creature catalog/,
		);
		assert.equal(await fs.readFile(output, 'utf8'), 'previous catalog');
		await fs.mkdir(path.join(root, 'data/monster'), { recursive: true });
		await fs.mkdir(path.join(root, 'data/scripts/spells/monster'), {
			recursive: true,
		});
		await fs.writeFile(
			path.join(root, 'data/scripts/spells/monster/internal.lua'),
			'invalid player spell metadata',
		);
		const creatureFile = path.join(root, 'data/monster/example.lua');
		const creatureSource =
			'local mType = Game.createMonsterType("Example")\nlocal monster = {}\nmonster.health = 100\nmonster.experience = 10\nmonster.outfit = {lookType = 99}\nmonster.flags = {summonable = false, convinceable = false}\nmonster.elements = {}\nmType:register(monster)';
		await fs.writeFile(creatureFile, creatureSource);
		await assert.rejects(
			execute(process.execPath, args),
			/Achievement definitions are missing/,
		);
		assert.equal(await fs.readFile(output, 'utf8'), 'previous catalog');
		await fs.mkdir(path.join(root, 'data/scripts/lib'), { recursive: true });
		const achievementFile = path.join(
			root,
			'data/scripts/lib/register_achievements.lua',
		);
		const achievementSource =
			'ACHIEVEMENTS = {[3] = {name = "Explorer", description = "Explore a cave", grade = 1, points = 2}}\nfor id, item in pairs(ACHIEVEMENTS) do Game.registerAchievement(id, item.name, item.description, item.secret, item.grade, item.points) end';
		await fs.writeFile(achievementFile, achievementSource);
		const configFile = path.join(root, 'config.lua');
		await fs.writeFile(
			configFile,
			'serverName = "Test Realm"\nworldType = "pvp"\nmaxPlayers = 0\nmysqlPass = "private fixture"',
		);
		await execute(process.execPath, args);
		const installed = await fs.readFile(output, 'utf8');
		const value = JSON.parse(installed) as {
			spells: unknown[];
			creatures: unknown[];
			achievements: unknown[];
			world: { name: string; pvpType: string; maxPlayers: number };
		};
		assert.equal(value.spells.length, 1);
		assert.equal(value.creatures.length, 1);
		assert.equal(value.achievements.length, 1);
		assert.deepEqual(value.world, {
			name: 'Test Realm',
			pvpType: 'pvp',
			maxPlayers: 0,
		});
		assert.equal(installed.includes('private fixture'), false);
		await fs.writeFile(configFile, 'worldType = dynamicType');
		await assert.rejects(execute(process.execPath, args), /literal expression/);
		assert.equal(await fs.readFile(output, 'utf8'), installed);
		await fs.writeFile(
			configFile,
			'serverName = "Test Realm"\nworldType = "pvp"\nmaxPlayers = 0',
		);
		await fs.writeFile(
			achievementFile,
			achievementSource.replace('points = 2', 'points = dynamicPoints'),
		);
		await assert.rejects(execute(process.execPath, args), /literal expression/);
		assert.equal(await fs.readFile(output, 'utf8'), installed);
		await fs.writeFile(achievementFile, achievementSource);
		await fs.writeFile(
			creatureFile,
			creatureSource.replace(
				'monster.health = 100',
				'monster.health = dynamicHealth',
			),
		);
		await assert.rejects(
			execute(process.execPath, args),
			/Unresolved metadata/,
		);
		assert.equal(await fs.readFile(output, 'utf8'), installed);
		assert.equal(
			(await fs.readdir(root)).filter((name) => name.endsWith('.tmp')).length,
			0,
		);
	} finally {
		assert.ok(path.relative(os.tmpdir(), root).startsWith('slender-catalog-'));
		await fs.rm(root, { recursive: true, force: true });
	}
});
