// @ts-nocheck -- This standalone Node.js installer is validated by its integration tests.
import { createHash, randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import {
	chmod,
	copyFile,
	cp,
	lstat,
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	realpath,
	rename,
	rm,
	unlink,
	writeFile,
} from 'node:fs/promises';
import {
	basename,
	dirname,
	isAbsolute,
	join,
	relative,
	resolve,
	sep,
} from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

import yauzl from 'yauzl';

const REPOSITORY = 'opentibiabr/slenderaac';
const CHANNEL_TAG = 'classic-assets-latest';
const RELEASE_BASE = `https://github.com/${REPOSITORY}/releases/download/`;
// Keep publication and installation bounds aligned with theme_assets.py.
const MAX_ZIP = {
	classic: 128 * 1024 * 1024,
	outfits: 256 * 1024 * 1024,
	items: 128 * 1024 * 1024,
	store: 128 * 1024 * 1024,
};
const MAX_EXPANDED = 512 * 1024 * 1024;
const MAX_FILE = 32 * 1024 * 1024;
const DOWNLOAD_TIMEOUT = 10 * 60 * 1000;

export const PACKS = Object.freeze({
	classic: {
		directories: ['classic', 'tools'],
		environment: 'THEME_ASSETS_ROOT',
	},
	outfits: { directories: ['outfits'], environment: 'OUTFIT_ASSETS_ROOT' },
	items: { directories: ['items'], environment: 'ITEM_ASSETS_ROOT' },
	store: { directories: ['store'], environment: 'STORE_ASSETS_ROOT' },
});

const isRecord = (value) =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

export const digest = (data) => createHash('sha256').update(data).digest('hex');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const exists = async (path) => {
	try {
		await lstat(path);
		return true;
	} catch (error) {
		if (error.code === 'ENOENT') return false;
		throw error;
	}
};

const optionalLstat = async (path) => {
	try {
		return await lstat(path);
	} catch (error) {
		if (error.code === 'ENOENT') return undefined;
		throw error;
	}
};

const isWithin = (parent, candidate) => {
	const path = relative(parent, candidate);
	return (
		path === '' ||
		(path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path))
	);
};

const canonicalPath = async (candidate) => {
	let cursor = resolve(candidate);
	const suffix = [];
	// eslint-disable-next-line no-constant-condition
	while (true) {
		// The walk always reaches an existing filesystem root or throws.
		try {
			return join(await realpath(cursor), ...suffix.reverse());
		} catch (error) {
			if (error.code !== 'ENOENT') throw error;
			const parent = dirname(cursor);
			if (parent === cursor) throw error;
			suffix.push(basename(cursor));
			cursor = parent;
		}
	}
};

export async function download(url, limit, onProgress) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT);
	try {
		const response = await fetch(url, {
			headers: { 'user-agent': 'SlenderAAC-Assets-Installer' },
			signal: controller.signal,
		});
		if (!response.ok || !response.body)
			throw new Error(`Download failed with HTTP ${response.status}`);
		const advertisedSize = Number(response.headers.get('content-length'));
		if (Number.isFinite(advertisedSize) && advertisedSize > limit)
			throw new Error('Download exceeds the permitted size');

		const chunks = [];
		let size = 0;
		for await (const value of response.body) {
			const chunk = Buffer.from(value);
			size += chunk.length;
			if (size > limit) {
				controller.abort();
				throw new Error('Download exceeds the permitted size');
			}
			chunks.push(chunk);
			onProgress?.(
				size,
				Number.isFinite(advertisedSize) ? advertisedSize : undefined,
			);
		}
		return Buffer.concat(chunks, size);
	} finally {
		clearTimeout(timeout);
	}
}

export function releaseUrl(value) {
	if (typeof value !== 'string' || !value.startsWith(RELEASE_BASE))
		throw new Error(
			'Package must be a release attachment from the application repository',
		);
	const parsed = new URL(value);
	const suffix = value.slice(RELEASE_BASE.length);
	if (
		parsed.search ||
		parsed.hash ||
		!/^classic-assets-[a-z0-9-]+\/[A-Za-z0-9._-]+\.zip$/.test(suffix) ||
		suffix.split('/')[0] === CHANNEL_TAG
	)
		throw new Error('Invalid package release URL');
	if (
		decodeURIComponent(suffix)
			.split('/')
			.some((part) => ['', '.', '..'].includes(part))
	)
		throw new Error('Invalid package release path');
	return value;
}

export function validateChannel(channel, pack) {
	if (
		!Object.hasOwn(PACKS, pack) ||
		!isRecord(channel) ||
		channel.schemaVersion !== 1 ||
		channel.name !== pack ||
		typeof channel.sha256 !== 'string' ||
		!/^[0-9a-f]{64}$/.test(channel.sha256) ||
		!Number.isInteger(channel.size) ||
		channel.size <= 0 ||
		channel.size > MAX_ZIP[pack]
	)
		throw new Error('Invalid asset release metadata');
	releaseUrl(channel.url);
	return channel;
}

export async function readChannel(pack) {
	const url = new URL(`${pack}-assets.json`, `${RELEASE_BASE}${CHANNEL_TAG}/`);
	url.searchParams.set('check', randomUUID().replaceAll('-', ''));
	const data = await download(url.href, 64 * 1024);
	return validateChannel(JSON.parse(data.toString('utf8')), pack);
}

export function safePath(name) {
	if (
		typeof name !== 'string' ||
		!name ||
		name.includes('\\') ||
		name.includes('\0')
	)
		throw new Error('Invalid archive path');
	const parts = name.replace(/\/+$/, '').split('/');
	for (const part of parts) {
		if (
			!part ||
			part === '.' ||
			part === '..' ||
			part.startsWith('.') ||
			/[ .]$/.test(part) ||
			// Control characters are invalid in every supported target filesystem.
			// eslint-disable-next-line no-control-regex
			/[<>:"|?*\u0000-\u001f]/.test(part) ||
			/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(part)
		)
			throw new Error(`Unsafe archive path: ${name}`);
	}
	return parts;
}

const inspectEntries = async (archive, pack) => {
	const entries = [];
	const seen = new Set();
	const maximumEntries =
		pack === 'classic' ? 10000 : pack === 'outfits' ? 200000 : 100000;
	let expandedSize = 0;
	for await (const entry of archive.eachEntry()) {
		const parts = safePath(entry.fileName);
		const directory = entry.fileName.endsWith('/');
		const kind = (entry.externalFileAttributes >>> 16) & 0o170000;
		const expectedKind = directory ? 0o040000 : 0o100000;
		const key = parts.join('/').toLocaleLowerCase('en-US');
		if (
			!PACKS[pack].directories.includes(parts[0]) ||
			(kind !== 0 && kind !== expectedKind) ||
			(entry.generalPurposeBitFlag & 1) !== 0 ||
			entry.uncompressedSize > MAX_FILE ||
			seen.has(key)
		)
			throw new Error(
				`Unsupported or duplicate archive entry: ${entry.fileName}`,
			);
		seen.add(key);
		expandedSize += entry.uncompressedSize;
		if (entries.length + 1 > maximumEntries || expandedSize > MAX_EXPANDED)
			throw new Error('Archive is too large');
		entries.push({ entry, parts, directory });
	}
	return entries;
};

const readJson = async (path) =>
	JSON.parse((await readFile(path)).toString('utf8'));

const walkFiles = async (root, prefix = '') => {
	const files = [];
	for (const entry of await readdir(join(root, prefix), {
		withFileTypes: true,
	})) {
		const name = prefix ? `${prefix}/${entry.name}` : entry.name;
		if (entry.isSymbolicLink())
			throw new Error(`Symbolic links are not supported: ${name}`);
		if (entry.isDirectory()) files.push(...(await walkFiles(root, name)));
		else if (entry.isFile()) files.push(name);
		else throw new Error(`Special files are not supported: ${name}`);
	}
	return files.sort();
};

const validateClassic = async (staging) => {
	const manifest = await readJson(join(staging, 'classic', 'manifest.json'));
	if (
		!isRecord(manifest) ||
		manifest.schemaVersion !== 1 ||
		manifest.name !== 'classic' ||
		typeof manifest.version !== 'string' ||
		!manifest.version ||
		!isRecord(manifest.assets) ||
		Object.keys(manifest.assets).length === 0 ||
		!isRecord(manifest.hashes) ||
		Object.keys(manifest.hashes).length === 0 ||
		manifest.localOnlyAssets
	)
		throw new Error('Invalid or non-public Classic manifest');

	for (const [name, expected] of Object.entries(manifest.hashes)) {
		const path = join(staging, 'classic', ...safePath(name));
		if (
			typeof expected !== 'string' ||
			digest(await readFile(path)) !== expected
		)
			throw new Error(`Asset checksum mismatch: ${name}`);
	}
	for (const name of Object.values(manifest.assets)) {
		if (typeof name !== 'string') throw new Error('Invalid mapped asset path');
		safePath(name);
		if (!Object.hasOwn(manifest.hashes, name))
			throw new Error(`Mapped asset has no checksum: ${name}`);
	}
	for (const required of [
		'classic/content/classic-border-1.gif',
		'tools/README.md',
	]) {
		const details = await optionalLstat(join(staging, ...required.split('/')));
		if (!details?.isFile())
			throw new Error(`Incomplete archive: missing ${required}`);
	}
	return manifest;
};

const validateSpritePack = async (staging, pack) => {
	const root = join(staging, pack);
	const manifest = await readJson(join(root, 'manifest.json'));
	if (
		!isRecord(manifest) ||
		manifest.schemaVersion !== 1 ||
		manifest.name !== pack ||
		typeof manifest.version !== 'string' ||
		!manifest.version ||
		!isRecord(manifest.hashes) ||
		Object.keys(manifest.hashes).length === 0
	)
		throw new Error(`Invalid ${pack} manifest`);

	const expectedFiles = [
		...Object.keys(manifest.hashes),
		'manifest.json',
	].sort();
	const actualFiles = await walkFiles(root);
	if (
		expectedFiles.length !== actualFiles.length ||
		expectedFiles.some((name, index) => name !== actualFiles[index])
	)
		throw new Error(`Unlisted or missing files in ${pack} archive`);

	let artwork = 0;
	for (const [name, expected] of Object.entries(manifest.hashes)) {
		const data = await readFile(join(root, ...safePath(name)));
		if (typeof expected !== 'string' || digest(data) !== expected)
			throw new Error(`Asset checksum mismatch: ${name}`);
		if (name === 'README.md') continue;
		artwork += 1;
		const png =
			data.subarray(0, 8).equals(Buffer.from('\x89PNG\r\n\x1a\n', 'latin1')) &&
			data.subarray(-8).equals(Buffer.from('IEND\xaeB`\x82', 'latin1'));
		const gif =
			['GIF87a', 'GIF89a'].includes(data.subarray(0, 6).toString('ascii')) &&
			data.subarray(-1).toString('ascii') === ';';
		let valid;
		if (pack === 'outfits')
			valid =
				/^[1-9][0-9]*\/[1-9][0-9]*_[12]_[123]_[1-4](?:_template)?\.png$/.test(
					name,
				) && png;
		else if (pack === 'items')
			valid =
				/^(?:[1-9][0-9]*|empty|no_(?:helmet|necklace|bagpack|armor|handright|handleft|legs|boots|ring|ammo))\.gif$/.test(
					name,
				) && gif;
		else
			valid = /^[A-Za-z0-9_/ &'().-]+\.(?:png|gif)$/.test(name) && (png || gif);
		if (!valid) throw new Error(`Unsupported ${pack} image: ${name}`);
	}
	if (artwork === 0) throw new Error(`Empty ${pack} artwork`);
	return manifest;
};

export async function unpack(payload, staging, pack = 'classic') {
	if (!Object.hasOwn(PACKS, pack))
		throw new Error(`Unknown asset package: ${pack}`);
	if (
		!Buffer.isBuffer(payload) ||
		payload.length === 0 ||
		payload.length > MAX_ZIP[pack]
	)
		throw new Error('Invalid archive size');
	const archive = await yauzl.fromBufferPromise(payload, {
		autoClose: false,
		strictFileNames: true,
		validateEntrySizes: true,
	});
	try {
		const entries = await inspectEntries(archive, pack);
		await mkdir(staging, { recursive: true });
		for (const { entry, parts, directory } of entries) {
			const target = join(staging, ...parts);
			if (!isWithin(staging, target))
				throw new Error(`Unsafe archive path: ${entry.fileName}`);
			if (directory) await mkdir(target, { recursive: true });
			else {
				await mkdir(dirname(target), { recursive: true });
				await pipeline(
					await archive.openReadStreamPromise(entry),
					createWriteStream(target, { flags: 'wx' }),
				);
			}
		}
	} finally {
		archive.close();
	}
	return pack === 'classic'
		? validateClassic(staging)
		: validateSpritePack(staging, pack);
}

export function envValue(text, name) {
	const pattern = new RegExp(
		`^[ \\t]*(?:export[ \\t]+)?${escapeRegex(name)}[ \\t]*=[ \\t]*(.*)$`,
		'gm',
	);
	const matches = [...text.matchAll(pattern)];
	if (matches.length === 0) return undefined;
	const value = matches.at(-1)[1].trim();
	if (value.startsWith("'") || value.startsWith('"')) {
		const end = value.indexOf(value[0], 1);
		if (end < 0) throw new Error(`Unclosed quote in ${name}`);
		return value.slice(1, end);
	}
	return value.split('#', 1)[0].trim();
}

const appendEnvironment = (text, line) =>
	`${text.replace(/\n+$/, '')}\n${line}\n`;

export function configureEnvironment(text, root, packs = ['classic']) {
	const rootValue = root.replaceAll('\\', '/');
	if (/[\r\n"$`]/.test(rootValue))
		throw new Error('Asset root contains unsupported environment characters');
	for (const pack of packs) {
		const name = PACKS[pack].environment;
		const destination = pack === 'classic' ? rootValue : `${rootValue}/${pack}`;
		const line = `${name}="${destination}"`;
		const source = `^[ \\t]*(?:export[ \\t]+)?${escapeRegex(name)}[ \\t]*=.*$`;
		if (new RegExp(source, 'm').test(text))
			text = text.replace(new RegExp(source, 'gm'), line);
		else text = appendEnvironment(text, line);
	}
	if (packs.includes('classic')) {
		for (const [name, value] of [
			['SLENDER_THEME', 'classic'],
			['SLENDER_THEME_SWITCHER_ENABLED', 'true'],
		]) {
			if (envValue(text, name) === undefined)
				text = appendEnvironment(text, `${name}=${value}`);
		}
	}
	return text;
}

export async function atomicEnvironment(path, content) {
	const temporary = join(dirname(path), `.env.assets-${randomUUID()}`);
	try {
		await writeFile(temporary, content, { flag: 'wx', mode: 0o600 });
		const current = await optionalLstat(path);
		if (current) await chmod(temporary, current.mode);
		await rename(temporary, path);
	} finally {
		await rm(temporary, { force: true });
	}
}

const movePath = async (source, destination) => {
	try {
		await rename(source, destination);
	} catch (error) {
		if (error.code !== 'EXDEV') throw error;
		await cp(source, destination, {
			recursive: true,
			errorOnExist: true,
			force: false,
		});
		await rm(source, { recursive: true });
	}
};

const activate = async (
	staging,
	root,
	environmentPath,
	environmentText,
	directories,
	legacyStores,
	writeEnvironment,
) => {
	const backup = join(root, `backup-${randomUUID().replaceAll('-', '')}`);
	const moved = [];
	const installed = [];
	const legacyMoved = [];
	for (const name of directories) {
		const target = join(root, name);
		const details = await optionalLstat(target);
		if (details && (details.isSymbolicLink() || !details.isDirectory()))
			throw new Error(
				`Installation target is not a regular directory: ${target}`,
			);
	}
	if (
		legacyStores.length ||
		(
			await Promise.all(directories.map((name) => exists(join(root, name))))
		).some(Boolean)
	)
		await mkdir(backup);
	try {
		for (const { name, path } of legacyStores) {
			await movePath(path, join(backup, name));
			legacyMoved.push({ name, path });
		}
		for (const name of directories) {
			const target = join(root, name);
			if (await exists(target)) {
				await movePath(target, join(backup, name));
				moved.push(name);
			}
			await movePath(join(staging, name), target);
			installed.push(name);
		}
		await writeEnvironment(environmentPath, environmentText);
	} catch (error) {
		try {
			for (const name of installed.reverse())
				await movePath(join(root, name), join(staging, name));
			for (const name of moved.reverse())
				await movePath(join(backup, name), join(root, name));
			for (const legacy of legacyMoved.reverse())
				await movePath(join(backup, legacy.name), legacy.path);
		} catch (rollbackError) {
			throw new Error(
				`Activation failed and rollback was incomplete: ${rollbackError.message}`,
				{
					cause: error,
				},
			);
		}
		throw error;
	}
	return moved.length || legacyMoved.length ? backup : undefined;
};

const samePack = async (staging, root, directories) => {
	for (const directory of directories) {
		const incoming = join(staging, directory);
		const installed = join(root, directory);
		const details = await optionalLstat(installed);
		if (!details?.isDirectory() || details.isSymbolicLink()) return false;
		const expected = await walkFiles(incoming);
		const actual = await walkFiles(installed);
		if (
			expected.length !== actual.length ||
			expected.some((name, index) => name !== actual[index])
		)
			return false;
		for (const name of expected) {
			const current = join(installed, ...name.split('/'));
			if ((await lstat(current)).isSymbolicLink()) return false;
			if (
				!(await readFile(current)).equals(
					await readFile(join(incoming, ...name.split('/'))),
				)
			)
				return false;
		}
	}
	return true;
};

const withInstallationLock = async (root, operation) => {
	const lock = join(root, '.classic-install.lock');
	try {
		await writeFile(lock, String(process.pid), { flag: 'wx' });
	} catch (error) {
		if (error.code === 'EEXIST')
			throw new Error(
				`Another installation owns ${lock}; if it was interrupted, remove the lock only after confirming it has stopped`,
			);
		throw error;
	}
	try {
		return await operation();
	} finally {
		await unlink(lock);
	}
};

export async function install(options = {}, services = {}) {
	const app = await canonicalPath(options.app ?? process.cwd());
	const applicationPackage = JSON.parse(
		(await readFile(join(app, 'package.json'))).toString('utf8'),
	);
	if (applicationPackage.name !== 'slenderaac')
		throw new Error('--app must identify the SlenderAAC application directory');

	const environmentPath = join(app, '.env');
	const environmentDetails = await optionalLstat(environmentPath);
	if (environmentDetails?.isSymbolicLink())
		throw new Error(
			'Refusing to replace a symlinked .env; configure a regular app .env',
		);
	const rawEnvironment = await readFile(
		environmentDetails ? environmentPath : join(app, '.env.dist'),
	);
	const normalizedEnvironment = rawEnvironment
		.toString('utf8')
		.replace(/^\uFEFF/, '')
		.replaceAll('\r\n', '\n');
	const processRoot = process.env.THEME_ASSETS_ROOT;
	const configuredRoot = processRoot?.trim()
		? processRoot
		: envValue(normalizedEnvironment, 'THEME_ASSETS_ROOT');
	const requestedRoot =
		options.root ??
		(configuredRoot?.trim() ? configuredRoot : undefined) ??
		join(dirname(app), `${basename(app)}-theme-assets`);
	const root = await canonicalPath(
		isAbsolute(requestedRoot) ? requestedRoot : join(app, requestedRoot),
	);
	if (isWithin(app, root))
		throw new Error(
			'Choose an asset root outside the application checkout. Run npm run install:assets -- --root ../theme-assets to select an external directory.',
		);

	const packs = [...new Set(options.packs ?? Object.keys(PACKS))];
	if (!packs.length || packs.some((pack) => !Object.hasOwn(PACKS, pack)))
		throw new Error(
			`--packs must contain one or more of: ${Object.keys(PACKS).join(', ')}`,
		);
	if (
		packs.includes('store') &&
		!(await exists(
			join(app, 'src', 'routes', 'images', 'store', '[...path]', '+server.ts'),
		))
	)
		throw new Error(
			'Update the SlenderAAC checkout before installing store assets: the external store route is missing. Use --packs classic outfits items with an older checkout.',
		);

	const directories = packs.flatMap((pack) => PACKS[pack].directories);
	for (const directory of directories) {
		if (isWithin(join(root, directory), app))
			throw new Error('Asset directory overlaps the application checkout');
	}

	const legacyStores = [];
	if (packs.includes('store')) {
		for (const [name, path] of [
			['legacy-store', join(app, 'static', 'images', 'store')],
			['legacy-built-store', join(app, 'build', 'client', 'images', 'store')],
		]) {
			const details = await optionalLstat(path);
			if (!details) continue;
			if (
				details.isSymbolicLink() ||
				(await canonicalPath(path)) !== resolve(path)
			)
				throw new Error(
					'Legacy store directory must not be a symlink; relocate it manually first',
				);
			if (!details.isDirectory())
				throw new Error('Legacy store path must be a directory');
			legacyStores.push({ name, path });
		}
	}

	let environmentText = configureEnvironment(
		normalizedEnvironment,
		root,
		packs,
	);
	if (rawEnvironment.includes(Buffer.from('\r\n')))
		environmentText = environmentText.replaceAll('\n', '\r\n');
	const environmentBytes = Buffer.from(environmentText);
	const loadChannel = services.readChannel ?? readChannel;
	const loadArchive = services.download ?? download;
	const writeEnvironment = services.atomicEnvironment ?? atomicEnvironment;

	await mkdir(root, { recursive: true });
	return withInstallationLock(root, async () => {
		const staging = await mkdtemp(join(root, '.classic-install-'));
		try {
			const manifests = [];
			for (const pack of packs) {
				const channel = validateChannel(await loadChannel(pack), pack);
				console.log(
					`Downloading the published ${pack} package (${(channel.size / 1024 / 1024).toFixed(1)} MiB)...`,
				);
				let nextQuarter = 1;
				const payload = await loadArchive(
					channel.url,
					MAX_ZIP[pack],
					(received) => {
						const completedQuarters = Math.floor((received / channel.size) * 4);
						while (nextQuarter <= completedQuarters && nextQuarter < 4) {
							console.log(`${pack}: ${nextQuarter * 25}% downloaded`);
							nextQuarter += 1;
						}
					},
				);
				if (
					payload.length !== channel.size ||
					digest(payload) !== channel.sha256
				)
					throw new Error(
						'Release checksum/size mismatch; installation was not changed',
					);
				console.log(`Validating and staging the ${pack} package...`);
				manifests.push(await unpack(payload, staging, pack));
			}

			let environmentBackup;
			if (
				environmentDetails &&
				!(await readFile(environmentPath)).equals(environmentBytes)
			) {
				environmentBackup = join(
					app,
					`.env.assets-backup-${randomUUID().replaceAll('-', '')}`,
				);
				await copyFile(environmentPath, environmentBackup);
			}

			let backup;
			if (
				(await samePack(staging, root, directories)) &&
				legacyStores.length === 0
			) {
				if (
					!environmentDetails ||
					!(await readFile(environmentPath)).equals(environmentBytes)
				)
					await writeEnvironment(environmentPath, environmentText);
				console.log('The installed package already matches this release.');
			} else {
				backup = await activate(
					staging,
					root,
					environmentPath,
					environmentText,
					directories,
					legacyStores,
					writeEnvironment,
				);
			}

			for (const manifest of manifests)
				console.log(
					`Installed ${manifest.name} ${manifest.version} (${Object.keys(manifest.hashes).length} verified files).`,
				);
			console.log(`Assets directory: ${root.replaceAll('\\', '/')}`);
			if (backup) console.log(`Previous package retained at ${backup}`);
			if (environmentBackup)
				console.log(`Previous environment retained at ${environmentBackup}`);
			console.log(
				'Restart the website to load the updated asset configuration.',
			);
			if (packs.includes('store'))
				console.log(
					'Store images: /images/store/ (point the game server coinImagesURL at your website).',
				);
			return { manifests, root, backup, environmentBackup };
		} finally {
			await rm(staging, { recursive: true, force: true });
		}
	});
}

const usage = `Install or update SlenderAAC website artwork.

Usage:
  npm run install:assets
  npm run install:assets -- --root <external-directory>
  npm run install:assets -- --packs classic outfits items store

Options:
  --app <directory>   SlenderAAC directory (default: current directory)
  --root <directory>  External asset root (default: existing config or a sibling directory)
  --packs <names...>  Packages to install (default: all four)
  --help              Show this help`;

export function parseArguments(values) {
	const options = {};
	for (let index = 0; index < values.length; index += 1) {
		const value = values[index];
		if (value === '--help' || value === '-h') return { help: true };
		if (value === '--app' || value === '--root') {
			const next = values[++index];
			if (!next || next.startsWith('--'))
				throw new Error(`${value} requires a directory`);
			options[value.slice(2)] = next;
			continue;
		}
		if (value === '--packs') {
			const packs = [];
			while (values[index + 1] && !values[index + 1].startsWith('--'))
				packs.push(values[++index]);
			if (!packs.length)
				throw new Error('--packs requires at least one package name');
			options.packs = packs;
			continue;
		}
		throw new Error(`Unknown option: ${value}`);
	}
	return options;
}

const isMain =
	process.argv[1] &&
	resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
const run = async () => {
	try {
		const options = parseArguments(process.argv.slice(2));
		if (options.help) console.log(usage);
		else await install(options);
	} catch (error) {
		console.error(`Website assets: ${error.message}`);
		process.exitCode = 1;
	}
};
if (isMain) void run();
