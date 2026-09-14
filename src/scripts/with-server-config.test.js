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
