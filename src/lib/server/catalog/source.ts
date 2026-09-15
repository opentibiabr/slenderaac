import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function readServerFiles(
	root: string,
	directories: string[],
	ref?: string,
) {
	root = await fs.realpath(root);
	for (const directory of directories)
		if (
			!/^[a-zA-Z0-9_./-]+$/.test(directory) ||
			path.isAbsolute(directory) ||
			directory.split('/').includes('..')
		)
			throw new Error('Invalid data directory');
	const files = new Map<string, string>();
	const wanted = (file: string) =>
		/\.(lua|xml)$/.test(file) &&
		!file.split('/').some((part) => part.startsWith('#'));
	if (ref) {
		const git = (args: string[], input?: string): Promise<Buffer> =>
			new Promise((resolve, reject) => {
				const child = execFile(
					'git',
					args,
					{ cwd: root, encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 },
					(error, stdout) => (error ? reject(error) : resolve(stdout)),
				);
				child.stdin?.end(input);
			});
		const revision = (
			await git([
				'rev-parse',
				'--verify',
				'--end-of-options',
				`${ref}^{commit}`,
			])
		)
			.toString()
			.trim();
		const names = (
			await git([
				'ls-tree',
				'-r',
				'--name-only',
				'-z',
				revision,
				'--',
				...directories,
			])
		)
			.toString()
			.split('\0')
			.filter(wanted);
		const batch = await git(
			['cat-file', '--batch'],
			names.map((name) => `${revision}:${name}\n`).join(''),
		);
		let offset = 0;
		for (const name of names) {
			const end = batch.indexOf(10, offset);
			const header = batch.subarray(offset, end).toString().split(' ');
			const size = Number(header[2]);
			if (
				end < 0 ||
				header[1] !== 'blob' ||
				!Number.isSafeInteger(size) ||
				size < 0 ||
				end + 1 + size >= batch.length ||
				size > 5_000_000
			)
				throw new Error('Invalid data blob');
			files.set(name, batch.subarray(end + 1, end + 1 + size).toString('utf8'));
			offset = end + 2 + size;
		}
		return { files, revision };
	}
	async function read(relative: string) {
		let resolved: string;
		try {
			resolved = await fs.realpath(path.join(root, relative));
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
			throw error;
		}
		const contained = path.relative(root, resolved);
		if (contained.startsWith('..') || path.isAbsolute(contained))
			throw new Error('Data path escapes server directory');
		const stat = await fs.stat(resolved);
		if (stat.isDirectory()) {
			for (const entry of (
				await fs.readdir(resolved, { withFileTypes: true })
			).sort((a, b) => a.name.localeCompare(b.name)))
				if (!entry.isSymbolicLink() && !entry.name.startsWith('#'))
					await read(`${relative}/${entry.name}`);
		} else if (wanted(relative) && stat.isFile()) {
			if (stat.size > 5_000_000) throw new Error('Data file is too large');
			files.set(relative, await fs.readFile(resolved, 'utf8'));
		}
	}
	for (const directory of directories) await read(directory);
	return { files, revision: null };
}

export function readVocations(xml: string): Map<string, string> {
	xml = xml.replace(/<!--[\s\S]*?-->/g, '');
	const entries = [...xml.matchAll(/<vocation\b([^>]*)>/g)].map((match) => {
		const attrs = Object.fromEntries(
			[...match[1].matchAll(/([a-z]+)\s*=\s*["']([^"']*)["']/gi)].map(
				(attr) => [attr[1], attr[2]],
			),
		);
		if (!attrs.name || !/^\d+$/.test(attrs.id) || !/^\d+$/.test(attrs.baseid))
			throw new Error('Invalid vocation definition');
		return attrs;
	});
	const names = new Map(
		entries
			.filter((entry) => entry.id === entry.baseid)
			.map((entry) => [entry.id, entry.name]),
	);
	return new Map(
		entries.map((entry) => {
			const base = names.get(entry.baseid);
			if (!base) throw new Error('Vocation has no base definition');
			return [entry.name.toLowerCase(), base];
		}),
	);
}
