import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { resolveDatabaseConfiguration } from './database-source.js';

const source = `mysqlHost = "127.0.0.1"
mysqlPort = 3306
mysqlUser = "server_user"
mysqlPass = "server-password"
mysqlDatabase = "otservbr-global"
mysqlSock = ""
`;
const oldUrl =
	'mysql://website:old-password@localhost:3306/canary?connection_limit=3&socket=old.sock';

/** @param {import('node:test').TestContext} t @param {string} content */
function fixture(t, content) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'slender-database-'));
	t.after(() => {
		assert.equal(path.dirname(directory), os.tmpdir());
		assert.ok(path.basename(directory).startsWith('slender-database-'));
		fs.rmSync(directory, { recursive: true, force: true });
	});
	const file = path.join(directory, 'config.lua');
	fs.writeFileSync(file, content);
	return file;
}

void test('the server configuration overrides a stale website database without changing either file or environment', (t) => {
	const file = fixture(t, source);
	const environment = Object.freeze({
		SERVER_CONFIG_FILE: file,
		DATABASE_URL: oldUrl,
	});
	const result = resolveDatabaseConfiguration(environment);
	const url = new URL(result.url);
	assert.equal(result.source, 'SERVER_CONFIG_FILE');
	assert.equal(result.database, 'otservbr-global');
	assert.equal(url.hostname, '127.0.0.1');
	assert.equal(url.port, '3306');
	assert.equal(url.username, 'server_user');
	assert.equal(url.password, 'server-password');
	assert.equal(url.pathname, '/otservbr-global');
	assert.equal(url.searchParams.get('connection_limit'), '3');
	assert.equal(url.searchParams.get('socket'), null);
	assert.match(result.warning ?? '', /DATABASE_URL.*ignored/);
	assert.doesNotMatch(result.warning ?? '', /password|mysql:\/\//);
	assert.equal(fs.readFileSync(file, 'utf8'), source);
	assert.equal(environment.DATABASE_URL, oldUrl);
});

void test('DATABASE_URL remains the fallback only when no server file is configured', () => {
	assert.deepEqual(
		resolveDatabaseConfiguration({
			DATABASE_URL: oldUrl,
			SERVER_CONFIG_FILE: ' ',
		}),
		{
			url: oldUrl,
			database: 'canary',
			source: 'DATABASE_URL',
			warning: null,
		},
	);
	for (const value of [
		'',
		'secret-invalid-url',
		'postgresql://user:secret@host/db',
		'mysql://host',
		'mysql://host/%ZZ',
	])
		assert.throws(
			() => resolveDatabaseConfiguration({ DATABASE_URL: value }),
			/^Error: Set SERVER_CONFIG_FILE or a valid MySQL DATABASE_URL\.$/,
		);
});

void test('a server file works without DATABASE_URL and encodes credentials, IPv6 and sockets', (t) => {
	const custom = source
		.replace('127.0.0.1', '::1')
		.replace('server_user', 'user@site')
		.replace('server-password', 'pa:ss/@#% é')
		.replace('otservbr-global', 'mundo é')
		.replace('mysqlSock = ""', 'mysqlSock = "/run/mysql/server.sock"');
	const file = fixture(t, custom);
	const result = resolveDatabaseConfiguration({ SERVER_CONFIG_FILE: file });
	const url = new URL(result.url);
	assert.equal(url.hostname, '[::1]');
	assert.equal(decodeURIComponent(url.username), 'user@site');
	assert.equal(decodeURIComponent(url.password), 'pa:ss/@#% é');
	assert.equal(decodeURIComponent(url.pathname.slice(1)), 'mundo é');
	assert.equal(url.searchParams.get('socket'), '/run/mysql/server.sock');
	assert.equal(result.warning, null);
	assert.equal(
		resolveDatabaseConfiguration({
			SERVER_CONFIG_FILE: file,
			DATABASE_URL: result.url,
		}).warning,
		null,
	);
	assert.ok(
		resolveDatabaseConfiguration({
			SERVER_CONFIG_FILE: file,
			DATABASE_URL: 'invalid-secret',
		}).warning,
	);
});

void test('a configured file never falls back after read, syntax, field or dynamic-setting errors', (t) => {
	const file = fixture(t, source);
	for (const content of [
		'syntax error secret-value',
		source.replace('mysqlDatabase = "otservbr-global"', ''),
		source.replace('3306', '0'),
		source.replace('3306', '65536'),
		source.replace('3306', '3306.5'),
		source.replace('"127.0.0.1"', '"host/path"'),
		source.replace('mysqlSock = ""', 'mysqlSock = false'),
		source.replace('otservbr-global', 'x'.repeat(65)),
		source + '\nmysqlDatabase = os.getenv("SECRET")',
		source + '\nif true then mysqlDatabase = "other" end',
		source + '\nlocal mysqlDatabase = "other"',
		source + '\n_G.mysqlDatabase = "other"',
		source + '\nfunction mysqlDatabase() end',
		source + '\ndofile("another-config.lua")',
		'do return end\n' + source,
	]) {
		fs.writeFileSync(file, content);
		assert.throws(
			() =>
				resolveDatabaseConfiguration({
					SERVER_CONFIG_FILE: file,
					DATABASE_URL: oldUrl,
				}),
			(error) => {
				assert.ok(error instanceof Error);
				assert.match(error.message, /DATABASE_URL was not used/);
				assert.doesNotMatch(
					error.message,
					/secret-value|old-password|server-password|mysql:\/\//,
				);
				return true;
			},
		);
	}
	fs.writeFileSync(file, ' '.repeat(1000001));
	for (const configFile of [file, path.dirname(file), file + '.missing'])
		assert.throws(
			() =>
				resolveDatabaseConfiguration({
					SERVER_CONFIG_FILE: configFile,
					DATABASE_URL: oldUrl,
				}),
			/DATABASE_URL was not used/,
		);
});
