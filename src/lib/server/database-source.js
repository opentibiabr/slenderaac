import fs from 'node:fs';

import { parse } from 'luaparse';

// Reject control characters in connection settings.
// eslint-disable-next-line no-control-regex
const controlCharacters = /[\u0000-\u001f\u007f]/;
const databaseFields = new Set([
	'mysqlHost',
	'mysqlPort',
	'mysqlUser',
	'mysqlPass',
	'mysqlDatabase',
	'mysqlSock',
]);

/** @param {string} source */
function databaseSettings(source) {
	/** @type {import('luaparse').Node[]} */
	const assignments = [];
	const ast = parse(Buffer.from(source).toString('latin1'), {
		luaVersion: '5.3',
		encodingMode: 'pseudo-latin1',
		comments: false,
		onCreateNode(node) {
			// A called script could overwrite globals after their literal declarations.
			if (node.type === 'FunctionDeclaration')
				throw new Error('Executable configuration is unsupported');
			if (
				[
					'CallExpression',
					'TableCallExpression',
					'StringCallExpression',
				].includes(node.type)
			)
				throw new Error('Executable configuration is unsupported');
			if (node.type === 'AssignmentStatement' || node.type === 'LocalStatement')
				assignments.push(node);
		},
	});
	if (
		ast.body.some(
			(node) =>
				node.type !== 'AssignmentStatement' && node.type !== 'LocalStatement',
		)
	)
		throw new Error('Configuration control flow is unsupported');
	const topLevel = new Set(ast.body);
	/** @type {Record<string, string | number>} */
	const settings = {};
	for (const node of assignments) {
		if (node.type !== 'AssignmentStatement' && node.type !== 'LocalStatement')
			continue;
		for (const [index, variable] of node.variables.entries()) {
			if (
				variable.type !== 'Identifier' ||
				['_G', '_ENV'].includes(variable.name)
			)
				throw new Error('Indirect configuration assignments are unsupported');
			if (!databaseFields.has(variable.name)) continue;
			const value = node.init[index];
			if (
				!topLevel.has(node) ||
				node.type === 'LocalStatement' ||
				(value?.type !== 'StringLiteral' && value?.type !== 'NumericLiteral')
			)
				throw new Error('Database settings require unconditional literals');
			settings[variable.name] =
				value.type === 'StringLiteral'
					? Buffer.from(value.value, 'latin1').toString('utf8')
					: value.value;
		}
	}
	return settings;
}

/** @param {string} value */
function databaseUrl(value) {
	try {
		const url = new URL(value);
		if (
			url.protocol === 'mysql:' &&
			url.hostname &&
			url.pathname.length > 1 &&
			!url.hash &&
			decodeURIComponent(url.pathname.slice(1))
		)
			return url;
	} catch {
		/* Invalid URLs must not leak credentials through parser errors. */
	}
	return null;
}

/** Shared by the server and package commands; never executes Lua or changes files.
 * @param {Record<string, string | undefined>} environment
 */
export function resolveDatabaseConfiguration(environment) {
	const previous = databaseUrl(environment.DATABASE_URL ?? '');
	const configFile = environment.SERVER_CONFIG_FILE?.trim();
	if (!configFile) {
		if (!previous)
			throw new Error('Set SERVER_CONFIG_FILE or a valid MySQL DATABASE_URL.');
		return {
			url: previous.href,
			database: decodeURIComponent(previous.pathname.slice(1)),
			source: 'DATABASE_URL',
			warning: null,
		};
	}

	let settings;
	try {
		const file = fs.statSync(configFile);
		if (!file.isFile() || file.size > 1000000) throw new Error('Invalid file');
		settings = databaseSettings(fs.readFileSync(configFile, 'utf8'));
	} catch {
		throw new Error(
			'Cannot read static database settings from SERVER_CONFIG_FILE. Check the path and config.lua syntax; executable settings are unsupported. DATABASE_URL was not used.',
		);
	}
	for (const field of [
		'mysqlHost',
		'mysqlUser',
		'mysqlPass',
		'mysqlDatabase',
	]) {
		const value = settings[field];
		if (
			typeof value !== 'string' ||
			(field !== 'mysqlPass' && !value.trim()) ||
			controlCharacters.test(value)
		)
			throw new Error(
				`Invalid ${field} in SERVER_CONFIG_FILE. Set an explicit string; DATABASE_URL was not used.`,
			);
	}
	if (
		String(settings.mysqlDatabase).length > 64 ||
		!Number.isInteger(settings.mysqlPort) ||
		Number(settings.mysqlPort) < 1 ||
		Number(settings.mysqlPort) > 65535 ||
		(settings.mysqlSock !== undefined &&
			(typeof settings.mysqlSock !== 'string' ||
				controlCharacters.test(settings.mysqlSock)))
	)
		throw new Error(
			'Invalid database name, mysqlPort or mysqlSock in SERVER_CONFIG_FILE. DATABASE_URL was not used.',
		);

	const host = String(settings.mysqlHost);
	let url;
	try {
		url = new URL(
			`mysql://${host.includes(':') && !host.startsWith('[') ? `[${host}]` : host}:${settings.mysqlPort}/`,
		);
		if (
			!url.hostname ||
			url.username ||
			url.password ||
			url.pathname !== '/' ||
			url.search ||
			url.hash ||
			/\s/.test(host)
		)
			throw new Error('Invalid host');
	} catch {
		throw new Error(
			'Invalid mysqlHost in SERVER_CONFIG_FILE. DATABASE_URL was not used.',
		);
	}
	url.username = encodeURIComponent(String(settings.mysqlUser));
	url.password = encodeURIComponent(String(settings.mysqlPass));
	url.pathname = `/${encodeURIComponent(String(settings.mysqlDatabase))}`;
	// Pool and TLS options belong to the website. The socket, like host/port, belongs to the server.
	url.search = previous?.search ?? '';
	url.searchParams.delete('socket');
	if (settings.mysqlSock)
		url.searchParams.set('socket', String(settings.mysqlSock));
	const changed =
		previous &&
		(previous.host !== url.host ||
			previous.pathname !== url.pathname ||
			previous.username !== url.username ||
			previous.password !== url.password ||
			previous.searchParams.get('socket') !== url.searchParams.get('socket'));
	return {
		url: url.href,
		database: String(settings.mysqlDatabase),
		source: 'SERVER_CONFIG_FILE',
		warning:
			changed || (!previous && environment.DATABASE_URL)
				? 'DATABASE_URL connection settings differ from config.lua and were ignored. Using SERVER_CONFIG_FILE for the website and database commands.'
				: null,
	};
}
