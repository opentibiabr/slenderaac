<script lang="ts">
	import { page } from '$app/stores';

	import type { InformationNode } from '$lib/information-content';
	import { informationAttributes } from '$lib/information-content';
	import { themePreviewHref } from '$lib/themes/preview';

	export let nodes: InformationNode[];
	function element(value: unknown) {
		return value as Exclude<InformationNode, string>;
	}
	function attributes(attrs: Record<string, string>) {
		const safe = informationAttributes(attrs);
		if (safe.href) safe.href = themePreviewHref($page.url, safe.href);
		return safe;
	}
</script>

<!-- Preserve the source document's inline whitespace between text and links. -->
<!-- prettier-ignore -->
{#each nodes as node}{#if typeof node === 'string'}{node}{:else if element(node).tag === 'img'}<img {...attributes(element(node).attrs)} alt={element(node).attrs.alt ?? ''} />{:else if element(node).tag === 'br'}<br />{:else}<svelte:element this={element(node).tag} {...attributes(element(node).attrs)}><svelte:self nodes={element(node).children} /></svelte:element>{/if}{/each}
