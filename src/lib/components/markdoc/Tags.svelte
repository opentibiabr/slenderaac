<!-- adapted from https://github.com/movingbrands/svelte-portable-text -->
<script lang="ts">
	import type { ComponentType } from 'svelte';
	import {
		default as Markdoc,
		type RenderableTreeNode,
	} from '@markdoc/markdoc';

	import { page } from '$app/stores';

	import { serverText } from '$lib/site-identity';

	import { PUBLIC_TITLE } from '$env/static/public';

	import { markdocAttributes } from './rendering';

	export let node: RenderableTreeNode;
	export let components: Map<string, ComponentType>;
	export let isRoot = false;
	$: identity = {
		name: $page.data.serverName ?? PUBLIC_TITLE,
		website: $page.url.origin,
	};
</script>

{#if typeof node === 'string' || typeof node === 'number'}
	{serverText(String(node), identity)}
{:else if Array.isArray(node)}
	{#each node as child}
		<svelte:self node={child} {components} />
	{/each}
{:else if node === null || typeof node !== 'object' || !Markdoc.Tag.isTag(node)}
	{''}
{:else if isRoot || !node.name}
	<svelte:self node={node.children} {components} />
{:else if components.has(node.name)}
	{@const component = components.get(node.name)}
	{@const props =
		node.name === 'Row' ? { center: node.attributes.center === true } : {}}
	<svelte:component this={component} {...props}>
		<svelte:self node={node.children} {components} />
	</svelte:component>
{:else}
	{@const attributes = markdocAttributes(
		node.name,
		node.attributes,
		$page.url,
		identity,
	)}
	{#if !attributes}
		<svelte:self node={node.children} {components} />
	{:else if node.name === 'br' || node.name === 'hr' || node.name === 'img'}
		<svelte:element this={node.name} {...attributes} />
	{:else}
		<svelte:element this={node.name} {...attributes}>
			<svelte:self node={node.children} {components} />
		</svelte:element>
	{/if}
{/if}
