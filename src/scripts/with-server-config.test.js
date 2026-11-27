import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const wrapper = fileURLToPath(
	new URL('./with-server-config.js', import.meta.url),
);

void test('package commands load the same config source, preserve arguments and stop before a command on invalid configuration', (t) => {
	const directory = fs.mkdtempSync(
		path.join(os.tmpdir(), 'slender-db-command-'),
	);
	t.after(() => {
		assert.equal(path.dirname(directory), os.tmpdir());
		assert.ok(path.basename(directory).startsWith('slender-db-command-'));
		fs.rmSync(directory, {
			recursive: true,
			force: true,
			maxRetries: 10,
			retryDelay: 100,
		});
	});
	fs.writeFileSync(
		path.join(directory, '.env'),
		'SERVER_CONFIG_FILE=./config.lua\nDATABASE_URL=mysql://old:old-secret@localhost:3306/old-database',
	);
	const file = path.join(directory, 'config.lua');
	fs.writeFileSync(
		file,
		'mysqlHost="127.0.0.1"\nmysqlPort=3306\nmysqlUser="user"\nmysqlPass="new-secret"\nmysqlDatabase="server-database"',
	);
	/** @type {NodeJS.ProcessEnv} */
	const environment = {
		...process.env,
		CHECKPOINT_DISABLE: '1',
		PRISMA_HIDE_UPDATE_MESSAGE: '1',
	};
	delete environment.DATABASE_URL;
	delete environment.SERVER_CONFIG_FILE;
	delete environment.DATABASE_CREDENTIAL_MODE;
	delete environment.DATABASE_MIGRATION_URL;
	const options = {
		cwd: directory,
		env: environment,
		encoding: /** @type {const} */ ('utf8'),
		timeout: 30000,
	};
	const version = spawnSync(
		process.execPath,
		[wrapper, 'vite', '--version'],
		options,
	);
	assert.equal(version.status, 0, version.stderr);
	assert.match(
		version.stdout,
		/source=SERVER_CONFIG_FILE database="server-database"/,
	);
	assert.match(version.stdout, /vite\//);
	assert.match(version.stderr, /DATABASE_URL.*ignored/);
	assert.doesNotMatch(
		version.stdout + version.stderr,
		/old-secret|new-secret|mysql:\/\//,
	);

	// Validation parses a fixture schema; it does not connect or migrate a database.
	const schema = path.join(directory, 'schema.prisma');
	fs.writeFileSync(
		schema,
		'datasource db {\n provider = "mysql"\n url = env("DATABASE_URL")\n}\nmodel Item {\n id Int @id\n}',
	);
	const validate = spawnSync(
		process.execPath,
		[wrapper, 'prisma', 'validate', '--schema', schema],
		options,
	);
	assert.equal(validate.status, 0, validate.stderr);
	assert.match(validate.stdout, /database="server-database"/);
	assert.match(validate.stdout, /is valid/);
	fs.writeFileSync(file, 'mysqlDatabase = "incomplete"');
	const invalid = spawnSync(
		process.execPath,
		[wrapper, 'vite', '--version'],
		options,
	);
	assert.equal(invalid.status, 1);
	assert.doesNotMatch(invalid.stdout, /vite\//);
	assert.match(invalid.stderr, /DATABASE_URL was not used/);
});

void test('separate credentials select the subprocess account and stop an incomplete migration before launch', (t) => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'slender-db-roles-'));
	t.after(() => {
		assert.equal(path.dirname(directory), os.tmpdir());
		assert.ok(path.basename(directory).startsWith('slender-db-roles-'));
		fs.rmSync(directory, { recursive: true, force: true });
	});
	fs.writeFileSync(
		path.join(directory, '.env'),
		[
			'DATABASE_CREDENTIAL_MODE=separate',
			'DATABASE_URL=mysql://site:site-secret@localhost:3306/fixture',
			'DATABASE_MIGRATION_ALIAS=${DATABASE_MIGRATION_URL}',
			'SERVER_CONFIG_FILE=./missing-config.lua',
		].join('\n'),
	);
	const probe = path.join(directory, 'child-probe.cjs');
	// Intercept just the tool process and inspect its actual incoming environment.
	// The command arguments are harmless --help invocations if interception fails.
	fs.writeFileSync(
		probe,
		`
const cli = process.argv[1]?.replaceAll('\\\\', '/');
if (cli?.endsWith('/prisma/build/index.js') || cli?.endsWith('/vite/bin/vite.js')) {
	const url = new URL(process.env.DATABASE_URL);
	console.log(JSON.stringify({
		account: url.username,
		migrationUrlCleared: process.env.DATABASE_MIGRATION_URL === '',
		migrationAliasCleared: process.env.DATABASE_MIGRATION_ALIAS === '',
		args: process.argv.slice(2),
	}));
	process.exit(0);
}
`,
	);
	/** @type {NodeJS.ProcessEnv} */
	const environment = {
		...process.env,
		NODE_OPTIONS:
			`${process.env.NODE_OPTIONS ?? ''} --require="${probe.replaceAll('\\', '/')}"`.trim(),
		DATABASE_MIGRATION_URL:
			'mysql://migrator:ddl-secret@localhost:3306/fixture',
	};
	delete environment.DATABASE_CREDENTIAL_MODE;
	delete environment.DATABASE_URL;
	delete environment.DATABASE_MIGRATION_ALIAS;
	delete environment.SERVER_CONFIG_FILE;
	const options = {
		cwd: directory,
		env: environment,
		encoding: /** @type {const} */ ('utf8'),
		timeout: 30000,
	};
	for (const [
		tool,
		args,
		account,
	] of /** @type {[string, string[], string][]} */ ([
		['vite', ['build', '--help'], 'site'],
		['prisma', ['generate', '--help'], 'site'],
		['prisma', ['migrate', 'deploy', '--help'], 'migrator'],
		['prisma', ['migrate', 'resolve', '--help'], 'migrator'],
		['prisma', ['migrate', 'dev', '--help'], 'migrator'],
	])) {
		const child = spawnSync(
			process.execPath,
			[wrapper, tool, ...args],
			options,
		);
		assert.equal(child.status, 0, child.stderr);
		const lines = child.stdout.trim().split(/\r?\n/);
		assert.deepEqual(JSON.parse(lines.at(-1) ?? ''), {
			account,
			migrationUrlCleared: true,
			migrationAliasCleared: true,
			args,
		});
		assert.doesNotMatch(
			child.stdout + child.stderr,
			/site-secret|ddl-secret|mysql:\/\//,
		);
	}

	delete environment.DATABASE_MIGRATION_URL;
	const missing = spawnSync(
		process.execPath,
		[wrapper, 'prisma', 'migrate', 'deploy', '--help'],
		options,
	);
	assert.equal(missing.status, 1);
	assert.equal(missing.stdout, '');
	assert.match(missing.stderr, /valid MySQL DATABASE_MIGRATION_URL/);
});
