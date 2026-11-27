import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

import { loadEnv } from 'vite';

import { resolveDatabaseConfiguration } from '../lib/server/database-source.js';

const [tool, ...args] = process.argv.slice(2);
const require = createRequire(import.meta.url);

try {
	if (tool !== 'vite' && tool !== 'prisma') throw new Error('Unsupported tool');
	const modeIndex = args.findIndex(
		(argument) => argument === '--mode' || argument === '-m',
	);
	const mode =
		(modeIndex >= 0
			? args[modeIndex + 1]
			: args.find((argument) => argument.startsWith('--mode='))?.slice(7)) ||
		(tool === 'vite' && ['build', 'preview'].includes(args[0])
			? 'production'
			: 'development');
	// Keep the process-only migration secret out of Vite's dotenv expansion and
	// mask the name if the subprocess loads dotenv again.
	const migrationUrl = process.env.DATABASE_MIGRATION_URL;
	process.env.DATABASE_MIGRATION_URL = '';
	const environment = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
	const purpose =
		tool === 'prisma' && args[0] === 'migrate' ? 'migration' : 'runtime';
	const configuration = resolveDatabaseConfiguration(
		{ ...environment, DATABASE_MIGRATION_URL: migrationUrl },
		purpose,
	);
	environment.DATABASE_URL = configuration.url;
	console.info(
		`[database.config] source=${configuration.source} database=${JSON.stringify(configuration.database)}`,
	);
	if (configuration.warning)
		console.warn(`[database.config] ${configuration.warning}`);
	const binary = path.join(
		path.dirname(require.resolve(`${tool}/package.json`)),
		tool === 'vite' ? 'bin/vite.js' : 'build/index.js',
	);
	const child = spawn(process.execPath, [binary, ...args], {
		env: environment,
		stdio: 'inherit',
	});
	const interrupt = () => child.kill('SIGINT');
	const terminate = () => child.kill('SIGTERM');
	process.on('SIGINT', interrupt);
	process.on('SIGTERM', terminate);
	child.once('error', () => {
		console.error(
			'[database.config] Could not start the package command. Check the installed dependencies.',
		);
		process.exitCode = 1;
	});
	child.once('close', (code) => {
		process.off('SIGINT', interrupt);
		process.off('SIGTERM', terminate);
		process.exitCode = code ?? 1;
	});
} catch (error) {
	// Only resolver-owned messages are safe; tool/parser errors may contain credentials.
	const message =
		error instanceof Error &&
		/^(Set (SERVER_CONFIG_FILE|DATABASE_CREDENTIAL_MODE)|Separate database credentials|Cannot read static database settings|Invalid (mysql|database name))/.test(
			error.message,
		)
			? error.message
			: 'Could not prepare the database command. Check configuration and installed dependencies.';
	console.error(`[database.config] ${message}`);
	process.exitCode = 1;
}
