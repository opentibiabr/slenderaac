import { fileURLToPath } from 'node:url';

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type PluginOption } from 'vite';

import { devDiagnostics } from './src/lib/server/dev-diagnostics';

const runtimeDirectories = [
	'.codex/visual',
	'outfits_anim',
	'items',
	'static/images/store',
	'build',
].map((directory) =>
	fileURLToPath(new URL(directory, import.meta.url)).replaceAll('\\', '/'),
);

export default defineConfig({
	plugins: [devDiagnostics(), sveltekit() as PluginOption],
	server: {
		watch: {
			// Runtime assets and local artifacts are read on demand, not compiled.
			// Git ignores do not stop Vite from walking these large directories.
			ignored: (path) =>
				runtimeDirectories.some(
					(directory) => path === directory || path.startsWith(`${directory}/`),
				),
		},
		warmup: {
			clientFiles: [
				'./src/routes/(app)/+layout.svelte',
				'./src/routes/(app)/+page.svelte',
				'./src/lib/themes/classic/Shell.svelte',
				'./src/lib/themes/legbone/Shell.svelte',
			],
			ssrFiles: [
				'./src/routes/(app)/+layout.server.ts',
				'./src/routes/(app)/+page.server.ts',
				'./src/routes/api/boosted/+server.ts',
			],
		},
	},
	optimizeDeps: {
		exclude: [
			'codemirror',
			'@codemirror/lang-markdown',
			'@codemirror/theme-one-dark',
			'svelte',
			'svelte-dnd-action',
		],
		include: [
			'@floating-ui/dom',
			'@formatjs/fast-memoize',
			'@formatjs/icu-messageformat-parser',
			'@formatjs/icu-skeleton-parser',
			'@fortawesome/free-brands-svg-icons',
			'@fortawesome/free-solid-svg-icons',
			'@markdoc/markdoc',
			'@skeletonlabs/skeleton',
			'date-fns',
			'deepmerge',
			'intl-messageformat',
			'svelte-fa',
			'svelte-i18n',
			'sveltekit-flash-message/client',
			'svooltip',
			'tiny-invariant',
			'tslib',
		],
	},
	ssr: {
		noExternal: [
			'intl-messageformat',
			'@formatjs/icu-messageformat-parser',
			'@formatjs/icu-skeleton-parser',
		],
	},
});
