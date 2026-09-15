import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const THEME_IMPLEMENTATION_IMPORT =
	/(?:\$lib\/themes|(?:\.\.\/)+themes)\/(?:classic|legbone)\//;
const CONCRETE_THEME_COMPARISON =
	/\b(?:selectedTheme|themeId|themeID)\s*(?:===|!==|==|!=)\s*['"](?:classic|legbone)['"]|['"](?:classic|legbone)['"]\s*(?:===|!==|==|!=)\s*\b(?:selectedTheme|themeId|themeID)\b/;
const THEME_NAMED_SELECTOR =
	/(?:^|[\s,(>+~])(?:\.|#)?theme-(?:classic|legbone)\b/;

const SOURCE_EXTENSIONS = new Set(['.css', '.js', '.mjs', '.svelte', '.ts']);
const IGNORED_PARTS = new Set(['node_modules', '.git', '.svelte-kit', 'build']);

function relativePath(root, filePath) {
	return path.relative(root, filePath).replaceAll(path.sep, '/');
}

function isThemeSubsystem(relative) {
	return (
		relative === 'src/lib/themes' || relative.startsWith('src/lib/themes/')
	);
}

export function scanSource(relative, source) {
	if (isThemeSubsystem(relative) || relative.includes('.test.')) return [];

	const violations = [];
	const lines = source.split(/\r?\n/);
	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		const lineNumber = index + 1;
		if (CONCRETE_THEME_COMPARISON.test(line)) {
			violations.push({
				rule: 'concrete-theme-comparison',
				file: relative,
				line: lineNumber,
				text: line.trim(),
			});
		}
		if (THEME_IMPLEMENTATION_IMPORT.test(line)) {
			violations.push({
				rule: 'theme-implementation-import',
				file: relative,
				line: lineNumber,
				text: line.trim(),
			});
		}
		if (THEME_NAMED_SELECTOR.test(line)) {
			violations.push({
				rule: 'theme-named-selector',
				file: relative,
				line: lineNumber,
				text: line.trim(),
			});
		}
	}
	return violations;
}

async function collectFiles(root, current = root) {
	const entries = await readdir(current, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		if (entry.name.startsWith('.') && entry.name !== '.env.example') continue;
		if (entry.isDirectory() && IGNORED_PARTS.has(entry.name)) continue;
		const fullPath = path.join(current, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectFiles(root, fullPath)));
		} else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
			files.push(fullPath);
		}
	}
	return files;
}

export async function findThemeViolations(root) {
	const files = await collectFiles(root);
	const violations = [];
	for (const file of files) {
		const relative = relativePath(root, file);
		const source = await readFile(file, 'utf8');
		violations.push(...scanSource(relative, source));
	}
	return violations;
}

async function main() {
	const root = path.resolve(
		path.dirname(fileURLToPath(import.meta.url)),
		'../..',
	);
	const violations = await findThemeViolations(root);
	if (violations.length === 0) {
		console.log('[check:themes] no shared theme-boundary violations');
		return;
	}
	for (const violation of violations) {
		console.error(
			`[check:themes] ${violation.rule}: ${violation.file}:${violation.line} ${violation.text}`,
		);
	}
	process.exitCode = 1;
}

if (
	process.argv[1] &&
	path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
	await main();
}
