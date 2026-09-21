// @ts-nocheck -- Test fixtures intentionally use compact dynamic JavaScript objects.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rm,
	writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
	digest,
	envValue,
	install,
	PACKS,
	releaseUrl,
	unpack,
	validateChannel,
} from './install-theme-assets.js';

const crcTable = Array.from({ length: 256 }, (_, value) => {
	let crc = value;
	for (let bit = 0; bit < 8; bit += 1)
		crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
	return crc >>> 0;
});

const crc32 = (data) => {
	let crc = 0xffffffff;
	for (const value of data) crc = crcTable[(crc ^ value) & 0xff] ^ (crc >>> 8);
	return (crc ^ 0xffffffff) >>> 0;
};

const zip = (files) => {
	const localParts = [];
	const centralParts = [];
	let offset = 0;
	for (const [name, source] of Object.entries(files)) {
		const fileName = Buffer.from(name);
		const data = Buffer.from(source);
		const checksum = crc32(data);
		const local = Buffer.alloc(30);
		local.writeUInt32LE(0x04034b50, 0);
		local.writeUInt16LE(20, 4);
		local.writeUInt16LE(0x800, 6);
		local.writeUInt32LE(checksum, 14);
		local.writeUInt32LE(data.length, 18);
		local.writeUInt32LE(data.length, 22);
		local.writeUInt16LE(fileName.length, 26);
		localParts.push(local, fileName, data);

		const central = Buffer.alloc(46);
		central.writeUInt32LE(0x02014b50, 0);
		central.writeUInt16LE((3 << 8) | 20, 4);
		central.writeUInt16LE(20, 6);
		central.writeUInt16LE(0x800, 8);
		central.writeUInt32LE(checksum, 16);
		central.writeUInt32LE(data.length, 20);
		central.writeUInt32LE(data.length, 24);
		central.writeUInt16LE(fileName.length, 28);
		central.writeUInt32LE((0o100644 << 16) >>> 0, 38);
		central.writeUInt32LE(offset, 42);
		centralParts.push(central, fileName);
		offset += local.length + fileName.length + data.length;
	}
	const centralDirectory = Buffer.concat(centralParts);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0);
	end.writeUInt16LE(Object.keys(files).length, 8);
	end.writeUInt16LE(Object.keys(files).length, 10);
	end.writeUInt32LE(centralDirectory.length, 12);
	end.writeUInt32LE(offset, 16);
	return Buffer.concat([...localParts, centralDirectory, end]);
};

const classicPackage = (version = 'test', changes = {}) => {
	const image = Buffer.from(`classic-${version}`);
	const manifest = {
		schemaVersion: 1,
		name: 'classic',
		version,
		assets: { border: 'content/classic-border-1.gif' },
		hashes: { 'content/classic-border-1.gif': digest(image) },
	};
	return zip({
		'classic/content/classic-border-1.gif': image,
		'classic/manifest.json': `${JSON.stringify(manifest)}\n`,
		'tools/README.md': 'installer tools',
		...changes,
	});
};

const spritePackage = (pack) => {
	const paths = {
		outfits: '128/1_1_1_3.png',
		items: '3031.gif',
		store: '13/Category_Coins.png',
	};
	const png = Buffer.concat([
		Buffer.from('\x89PNG\r\n\x1a\n', 'latin1'),
		Buffer.from('image'),
		Buffer.from('IEND\xaeB`\x82', 'latin1'),
	]);
	const image = pack === 'items' ? Buffer.from('GIF89a-test;', 'ascii') : png;
	const files = { [paths[pack]]: image, 'README.md': Buffer.from('readme') };
	const manifest = {
		schemaVersion: 1,
		name: pack,
		version: 'test',
		hashes: Object.fromEntries(
			Object.entries(files).map(([name, data]) => [name, digest(data)]),
		),
	};
	return zip({
		...Object.fromEntries(
			Object.entries(files).map(([name, data]) => [`${pack}/${name}`, data]),
		),
		[`${pack}/manifest.json`]: `${JSON.stringify(manifest)}\n`,
	});
};

const fixture = async () => {
	const temporary = await mkdtemp(join(tmpdir(), 'slender-assets-test-'));
	const app = join(temporary, 'application');
	const root = join(temporary, 'assets with spaces');
	await mkdir(join(app, 'src', 'routes', 'images', 'store', '[...path]'), {
		recursive: true,
	});
	await writeFile(join(app, 'package.json'), '{"name":"slenderaac"}\n');
	await writeFile(
		join(app, '.env.dist'),
		'DATABASE_URL="private-test-value"\r\nSLENDER_THEME=legbone\r\nSLENDER_THEME_SWITCHER_ENABLED=false\r\nTHEME_ASSETS_ROOT=\r\n',
	);
	await writeFile(
		join(app, 'src', 'routes', 'images', 'store', '[...path]', '+server.ts'),
		'// compatible checkout fixture\n',
	);
	return { temporary, app, root };
};

const servicesFor = (payloads, changes = {}) => ({
	readChannel: (pack) => {
		const payload = payloads[pack];
		return Promise.resolve({
			schemaVersion: 1,
			name: pack,
			sha256: digest(payload),
			size: payload.length,
			url: `https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-test/${pack}.zip`,
		});
	},
	download: (url) =>
		Promise.resolve(payloads[url.split('/').at(-1).replace('.zip', '')]),
	...changes,
});

void test('installs every package, preserves settings and repeats without backup churn', async () => {
	const { temporary, app, root } = await fixture();
	const payloads = Object.fromEntries(
		Object.keys(PACKS).map((pack) => [
			pack,
			pack === 'classic' ? classicPackage() : spritePackage(pack),
		]),
	);
	try {
		await install({ app, root }, servicesFor(payloads));
		const environment = (await readFile(join(app, '.env'))).toString();
		assert.match(environment, /DATABASE_URL="private-test-value"\r\n/);
		assert.equal(envValue(environment, 'SLENDER_THEME'), 'legbone');
		assert.equal(
			envValue(environment, 'SLENDER_THEME_SWITCHER_ENABLED'),
			'false',
		);
		for (const [pack, configuration] of Object.entries(PACKS)) {
			const expected = (
				pack === 'classic' ? root : join(root, pack)
			).replaceAll('\\', '/');
			assert.equal(envValue(environment, configuration.environment), expected);
		}
		await install({ app, root }, servicesFor(payloads));
		assert.equal(
			(await readdir(root)).some((name) => name.startsWith('backup-')),
			false,
		);
	} finally {
		await rm(temporary, { recursive: true, force: true });
	}
});

void test('fresh installations with empty roots choose an external sibling and install all packages', async () => {
	const originalRoot = process.env.THEME_ASSETS_ROOT;
	delete process.env.THEME_ASSETS_ROOT;
	const payloads = Object.fromEntries(
		Object.keys(PACKS).map((pack) => [
			pack,
			pack === 'classic' ? classicPackage() : spritePackage(pack),
		]),
	);
	try {
		for (const [file, value] of [
			['.env.dist', ''],
			['.env', ''],
			['.env', '""'],
			['.env', "''"],
			['.env', "'   '"],
			['.env', undefined],
		]) {
			const { temporary, app } = await fixture();
			try {
				await writeFile(
					join(app, file),
					value === undefined
						? 'SLENDER_THEME=legbone\n'
						: `THEME_ASSETS_ROOT=${value}\nSLENDER_THEME=legbone\n`,
				);
				const result = await install({ app }, servicesFor(payloads));
				const expectedRoot = join(temporary, 'application-theme-assets');
				assert.equal(result.root, expectedRoot);
				assert.equal(result.manifests.length, 4);
				const environment = (await readFile(join(app, '.env'))).toString();
				assert.equal(envValue(environment, 'SLENDER_THEME'), 'legbone');
				for (const [pack, config] of Object.entries(PACKS)) {
					assert.equal(
						envValue(environment, config.environment),
						(pack === 'classic'
							? expectedRoot
							: join(expectedRoot, pack)
						).replaceAll('\\', '/'),
					);
					assert.equal(
						JSON.parse(
							await readFile(join(expectedRoot, pack, 'manifest.json'), 'utf8'),
						).name,
						pack,
					);
				}
			} finally {
				assert.equal(dirname(temporary), tmpdir());
				await rm(temporary, { recursive: true, force: true });
			}
		}
	} finally {
		if (originalRoot === undefined) delete process.env.THEME_ASSETS_ROOT;
		else process.env.THEME_ASSETS_ROOT = originalRoot;
	}
});

void test('blank process roots reuse file configuration while explicit roots retain precedence', async () => {
	const { temporary, app, root } = await fixture();
	const originalRoot = process.env.THEME_ASSETS_ROOT;
	const services = servicesFor({ classic: classicPackage() });
	try {
		await writeFile(
			join(app, '.env'),
			`THEME_ASSETS_ROOT="${root.replaceAll('\\', '/')}"\n`,
		);
		process.env.THEME_ASSETS_ROOT = '   ';
		assert.equal(
			(await install({ app, packs: ['classic'] }, services)).root,
			root,
		);
		const processRoot = join(temporary, 'process-assets');
		process.env.THEME_ASSETS_ROOT = processRoot;
		assert.equal(
			(await install({ app, packs: ['classic'] }, services)).root,
			processRoot,
		);
		assert.equal(
			(await install({ app, root, packs: ['classic'] }, services)).root,
			root,
		);
	} finally {
		if (originalRoot === undefined) delete process.env.THEME_ASSETS_ROOT;
		else process.env.THEME_ASSETS_ROOT = originalRoot;
		assert.equal(dirname(temporary), tmpdir());
		await rm(temporary, { recursive: true, force: true });
	}
});

void test('a failed package checksum leaves the installed release unchanged', async () => {
	const { temporary, app, root } = await fixture();
	try {
		await install(
			{ app, root, packs: ['classic'] },
			servicesFor({ classic: classicPackage('one') }),
		);
		const payload = classicPackage('two');
		const services = servicesFor({ classic: payload });
		services.readChannel = () =>
			Promise.resolve({
				schemaVersion: 1,
				name: 'classic',
				sha256: '0'.repeat(64),
				size: payload.length,
				url: 'https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-test/classic.zip',
			});
		await assert.rejects(
			install({ app, root, packs: ['classic'] }, services),
			/checksum\/size mismatch/,
		);
		assert.equal(
			JSON.parse(
				(await readFile(join(root, 'classic', 'manifest.json'))).toString(),
			).version,
			'one',
		);
	} finally {
		await rm(temporary, { recursive: true, force: true });
	}
});

void test('an environment activation failure restores the previous package', async () => {
	const { temporary, app, root } = await fixture();
	try {
		await install(
			{ app, root, packs: ['classic'] },
			servicesFor({ classic: classicPackage('one') }),
		);
		await assert.rejects(
			install(
				{ app, root, packs: ['classic'] },
				servicesFor(
					{ classic: classicPackage('two') },
					{
						atomicEnvironment: () => Promise.reject(new Error('read only')),
					},
				),
			),
			/read only/,
		);
		assert.equal(
			JSON.parse(
				(await readFile(join(root, 'classic', 'manifest.json'))).toString(),
			).version,
			'one',
		);
	} finally {
		await rm(temporary, { recursive: true, force: true });
	}
});

void test('rejects unsafe archive paths and duplicate case-insensitive names', async () => {
	const temporary = await mkdtemp(
		join(tmpdir(), 'slender-assets-archive-test-'),
	);
	try {
		await assert.rejects(
			unpack(
				classicPackage('test', { '../outside': 'bad' }),
				join(temporary, 'traversal'),
			),
			/invalid relative path|Unsafe archive path/,
		);
		await assert.rejects(
			unpack(
				classicPackage('test', { 'tools/readme.md': 'collision' }),
				join(temporary, 'duplicate'),
			),
			/duplicate archive entry/,
		);
	} finally {
		await rm(temporary, { recursive: true, force: true });
	}
});

void test('rejects invalid roots and package names before contacting the release channel', async () => {
	const { temporary, app, root } = await fixture();
	let calls = 0;
	try {
		await assert.rejects(
			install(
				{ app, root: join(app, 'assets'), packs: ['classic'] },
				{
					readChannel: () => {
						calls += 1;
						return Promise.resolve(undefined);
					},
				},
			),
			/outside the application checkout/,
		);
		await assert.rejects(
			install(
				{ app, root, packs: ['toString'] },
				{ readChannel: () => (calls += 1) },
			),
			/--packs must contain/,
		);
		assert.equal(calls, 0);
	} finally {
		await rm(temporary, { recursive: true, force: true });
	}
});

void test('only accepts immutable versioned application release URLs', () => {
	assert.equal(
		releaseUrl(
			'https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-test/classic.zip',
		),
		'https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-test/classic.zip',
	);
	for (const url of [
		'https://example.com/classic.zip',
		'https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-latest/classic.zip',
		'https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-test/classic.zip?changed=1',
	])
		assert.throws(() => releaseUrl(url));
});

void test('walking outfit downloads have a larger bounded allowance without relaxing other packs', () => {
	const channel = (name, size) => ({
		schemaVersion: 1,
		name,
		size,
		sha256: 'a'.repeat(64),
		url: `https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-test/${name}.zip`,
	});
	for (const pack of Object.keys(PACKS)) {
		const limit = (pack === 'outfits' ? 256 : 128) * 1024 * 1024;
		assert.equal(validateChannel(channel(pack, limit), pack).size, limit);
		assert.throws(
			() => validateChannel(channel(pack, limit + 1), pack),
			/Invalid asset release metadata/,
		);
	}
	assert.throws(() => validateChannel(channel('toString', 1), 'toString'));
});

void test('test fixture digests use the same SHA-256 representation as the installer', () => {
	assert.equal(
		digest(Buffer.from('assets')),
		createHash('sha256').update('assets').digest('hex'),
	);
});
