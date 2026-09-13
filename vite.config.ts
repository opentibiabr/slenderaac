import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type PluginOption } from 'vite';

export default defineConfig({
	plugins: [sveltekit() as PluginOption],
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
