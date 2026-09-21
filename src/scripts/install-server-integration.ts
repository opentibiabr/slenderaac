import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const rootIndex = args.indexOf('--root');
if (rootIndex < 0 || !args[rootIndex + 1]) {
	throw new Error(
		'Usage: bun run install:server-integration --root <server-directory> [--replace]',
	);
}
const root = await fs.realpath(args[rootIndex + 1]);
await fs.access(path.join(root, 'config.lua'));
const scripts = await fs.realpath(path.join(root, 'data', 'scripts'));
await fs.access(path.join(scripts, 'lib', 'register_monster_type.lua'));
const destination = path.join(scripts, 'slender');
await fs.mkdir(destination, { recursive: true });
const resolved = await fs.realpath(destination);
if (
	path.relative(scripts, resolved).startsWith('..') ||
	path.isAbsolute(path.relative(scripts, resolved))
) {
	throw new Error('Server integration directory must stay inside data/scripts');
}
const source = fileURLToPath(
	new URL('../../integrations/canary/kill-statistics.lua', import.meta.url),
);
const target = path.join(resolved, 'kill-statistics.lua');
const incoming = await fs.readFile(source);
try {
	const stat = await fs.lstat(target);
	if (!stat.isFile() || stat.isSymbolicLink())
		throw new Error('Integration target must be a regular file');
	const installed = await fs.readFile(target);
	if (!installed.equals(incoming) && !args.includes('--replace')) {
		throw new Error(
			'Existing integration differs. Review it before installing with --replace.',
		);
	}
} catch (error) {
	if (
		!(error instanceof Error) ||
		!('code' in error) ||
		error.code !== 'ENOENT'
	)
		throw error;
}
await fs.writeFile(target, incoming);
console.info(
	'Installed kill statistics integration. Start or restart the game server to activate collection.',
);
