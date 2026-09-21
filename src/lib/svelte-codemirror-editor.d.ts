declare module 'svelte-codemirror-editor' {
	import type { SvelteComponent } from 'svelte';
	import type { Extension } from '@codemirror/state';

	interface CodeMirrorProps {
		value?: string;
		lang?: Extension;
		theme?: Extension | string;
		extensions?: Extension[];
		readonly?: boolean;
		placeholder?: string;
		styles?: Record<string, Record<string, string>>;
	}

	export default class CodeMirror extends SvelteComponent<CodeMirrorProps> {}
}