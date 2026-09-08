<!-- adapted from https://github.com/movingbrands/svelte-portable-text -->
<script lang="ts">
	import type { ComponentType } from 'svelte';
	import {
		default as Markdoc,
		type RenderableTreeNode,
	} from '@markdoc/markdoc';

	import { page } from '$app/stores';

	import { themePreviewHref } from '$lib/themes/preview';

	export let node: RenderableTreeNode;
	export let components: Map<string, ComponentType>;
	export let isRoot = false;

	function previewAttributes(value: unknown, url: URL) {
		const attributes = value as Record<string, unknown>;
		if (
			!url.searchParams.has('themePreview') ||
			typeof attributes.href !== 'string'
		)
			return attributes;
		return { ...attributes, href: themePreviewHref(url, attributes.href) };
	}

	const nodeName = (node: RenderableTreeNode) => {
		if (typeof node === 'string' || typeof node === 'number') return 'text';
		if (Array.isArray(node)) return 'fragment';
		if (node === null || typeof node !== 'object') return 'empty';
		if (!Markdoc.Tag.isTag(node)) return 'empty';
		return node.name;
	};

	const filterAttributes = (value: unknown) => {
		const attributes = value as Record<string, unknown>;
		return typeof attributes.center === 'boolean'
			? { center: attributes.center }
			: {};
	};
</script>

{#if typeof node === 'string' || typeof node === 'number'}
	{@html node}
{:else if Array.isArray(node)}
	{#each node as child}
		<svelte:self node={child} {components} />
	{/each}
{:else if node === null || typeof node !== 'object' || !Markdoc.Tag.isTag(node)}
	{''}
{:else if !node.name}
	<svelte:self node={node.children} {components} />
{:else if components.has(nodeName(node))}
	{@const component = components.get(nodeName(node))}
	{@const filteredAttrs = filterAttributes(node.attributes)}
	<svelte:component this={component} {...filteredAttrs}>
		<svelte:self node={node.children} {components} />
	</svelte:component>
{:else if node.children.length > 0}
	{#if isRoot}
		<svelte:self node={node.children} {components} />
	{:else}
		<svelte:element
			this={node.name}
			{...previewAttributes(node.attributes, $page.url)}>
			<svelte:self node={node.children} {components} />
		</svelte:element>
	{/if}
{:else}
	<svelte:element
		this={node.name}
		{...previewAttributes(node.attributes, $page.url)} />
{/if}
