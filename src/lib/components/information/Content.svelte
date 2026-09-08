<script lang="ts">
	import { page } from '$app/stores';

	import type { InformationNode } from '$lib/information-content';
	import TableFrame from '$lib/components/news/TableFrame.svelte';
	import TableSurface from '$lib/components/news/TableSurface.svelte';
	import { informationDestination } from '$lib/information';
	import { informationAttributes } from '$lib/information-content';
	import { themePreviewHref } from '$lib/themes/preview';

	import { PUBLIC_DOWNLOAD_URL } from '$env/static/public';

	import ActionLink from './ActionLink.svelte';
	import Tooltip from './Tooltip.svelte';

	export let nodes: InformationNode[];
	function element(value: unknown) {
		return value as Exclude<InformationNode, string>;
	}
	function attributes(attrs: Record<string, string>) {
		const safe = informationAttributes(attrs);
		if (safe.href)
			safe.href = themePreviewHref(
				$page.url,
				informationDestination(safe.href, PUBLIC_DOWNLOAD_URL),
			);
		return safe;
	}
</script>

<!-- Preserve the source document's inline whitespace between text and links. -->
<!-- prettier-ignore -->
{#each nodes as node}{#if typeof node === 'string'}{node}{:else if element(node).tag === 'table-frame'}<div class="information-table"><TableFrame assets={$page.data.themeAssets}><svelte:fragment slot="caption">{element(node).attrs.title}</svelte:fragment><div class="information-table__stack"><svelte:self nodes={element(node).children} /></div></TableFrame></div>{:else if element(node).tag === 'table-surface'}<TableSurface assets={$page.data.themeAssets} width="100%"><svelte:self nodes={element(node).children} /></TableSurface>{:else if element(node).tag === 'tooltip'}<Tooltip attrs={attributes(element(node).attrs)}><svelte:self nodes={element(node).children} /></Tooltip>{:else if element(node).tag === 'action'}<ActionLink attrs={attributes(element(node).attrs)}><svelte:self nodes={element(node).children} /></ActionLink>{:else if element(node).tag === 'img'}<img {...attributes(element(node).attrs)} alt={element(node).attrs.alt ?? ''} />{:else if element(node).tag === 'br'}<br />{:else}<svelte:element this={element(node).tag} {...attributes(element(node).attrs)}><svelte:self nodes={element(node).children} /></svelte:element>{/if}{/each}

<style>
	:global(.theme-cip-slender) .information-table :global(.cip-table-scroll) {
		overflow: visible;
	}
	:global(.theme-cip-slender) .information-table {
		width: calc(100% + 2px);
	}
	:global(.theme-cip-slender) .information-table__stack {
		display: flex;
		flex-direction: column;
		gap: 9px;
		padding: 8px 7px 8px 6px;
	}
</style>
