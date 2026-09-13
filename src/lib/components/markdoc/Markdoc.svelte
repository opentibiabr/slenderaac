<script lang="ts">
	import type { ComponentType } from 'svelte';
	import {
		type Config as MarkdocConfig,
		default as Markdoc,
	} from '@markdoc/markdoc';

	import Callout from '$lib/components/markdoc/Callout.svelte';
	import Col from '$lib/components/markdoc/Col.svelte';
	import Row from '$lib/components/markdoc/Row.svelte';
	import { deepMerge } from '$lib/utils';

	import { PUBLIC_BASE_URL, PUBLIC_TITLE } from '$env/static/public';

	import Tags from './Tags.svelte';

	const defaultConfig = {
		tags: {
			col: {
				render: 'Col',
				description: 'Display the enclosed content in a flex-col container',
				children: ['paragraph', 'tag', 'list'],
				attributes: {
					center: {
						type: Boolean,
						default: false,
					},
				},
			},
			row: {
				render: 'Row',
				description: 'Display the enclosed content in a flex-row container',
				children: ['paragraph', 'tag', 'list'],
				attributes: {
					center: {
						type: Boolean,
						default: false,
					},
				},
			},
			callout: {
				render: 'Callout',
				description: 'Display the enclosed content in a callout box',
				children: ['paragraph', 'tag', 'list'],
				attributes: {},
			},
		},
	};
	export let content = '';
	export let config: MarkdocConfig = {
		variables: {
			title: PUBLIC_TITLE,
			baseUrl: PUBLIC_BASE_URL,
		},
	};
	let components: Map<string, ComponentType> = new Map();
	components.set('Callout', Callout);
	components.set('Row', Row);
	components.set('Col', Col);

	const ast = Markdoc.parse(content);
	const node = Markdoc.transform(ast, deepMerge(defaultConfig, config));
</script>

{#if node}
	<article
		class="flex flex-col gap-1 w-full prose dark:prose-invert prose-headings:my-1 prose-ul:my-0 prose-p:my-2 prose-table:my-1 prose-th:!py-2 prose-td:!py-2">
		<Tags {node} {components} isRoot />
	</article>
{/if}
