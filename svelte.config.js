import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/kit/vite';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	vitePlugin: {
		inspector: false,
		onwarn(warning, handler) {
			// svelte-email 0.0.4 emits this from its own Column component.
			// Keep the exception exact so warnings from application components remain visible.
			const filename = warning.filename?.replaceAll('\\', '/');
			if (
				warning.code === 'a11y-no-interactive-element-to-noninteractive-role' &&
				filename?.endsWith(
					'/node_modules/svelte-email/components/Column.svelte',
				)
			)
				return;
			handler?.(warning);
		},
	},
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
	},
};
export default config;
