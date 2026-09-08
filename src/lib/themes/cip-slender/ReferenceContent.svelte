<script lang="ts">
	import { page } from '$app/stores';

	import { themePreviewHref } from '$lib/themes/preview';

	import type { ReferenceNode } from './reference-types';

	export let nodes: ReferenceNode[];
	const allowedTags = new Set([
		'p',
		'div',
		'center',
		'span',
		'b',
		'strong',
		'em',
		'i',
		'ul',
		'ol',
		'li',
		'br',
		'img',
		'a',
	]);

	function attributes(attrs: Record<string, string>, url: URL, image = false) {
		const safe = Object.fromEntries(
			Object.entries(attrs).filter(([key, value]) => {
				if (key === 'src')
					return value.startsWith('/theme-assets/cip-slender/');
				if (key === 'href') return /^(https?:\/\/|\/(?!\/)|#)/.test(value);
				return ['align', 'hspace', 'vspace', 'width', 'height', 'alt'].includes(
					key,
				);
			}),
		);
		const spacing = [
			['hspace', 'inline'],
			['vspace', 'block'],
		]
			.filter(([name]) => /^\d{1,3}$/.test(attrs[name] ?? ''))
			.map(([name, axis]) => `margin-${axis}: ${attrs[name]}px`);
		if (
			image &&
			/^[1-9]\d{0,3}$/.test(attrs.width ?? '') &&
			/^[1-9]\d{0,3}$/.test(attrs.height ?? '')
		) {
			spacing.push(
				`width: ${attrs.width}px`,
				`aspect-ratio: ${attrs.width} / ${attrs.height}`,
			);
		}
		if (spacing.length) safe.style = spacing.join('; ');
		if (safe.href) safe.href = themePreviewHref(url, safe.href);
		return safe;
	}
	function imageLink(value: string | undefined) {
		return value?.startsWith('/theme-assets/cip-slender/') ? value : null;
	}
	function elementNode(value: unknown) {
		return value as Exclude<ReferenceNode, string>;
	}
</script>

<!-- prettier-ignore -->{#each nodes as node}{#if typeof node === 'string'}{node}{:else}{#if allowedTags.has(elementNode(node).tag)}{#if elementNode(node).tag === 'img' && imageLink(elementNode(node).imageHref)}<a href={imageLink(elementNode(node).imageHref)} data-cip-media="image" target="_blank" rel="noreferrer" aria-label="Open full-size image"><img {...attributes(elementNode(node).attrs, $page.url, true)} alt={elementNode(node).attrs.alt ?? ''} /></a>{:else if elementNode(node).tag === 'img' || elementNode(node).tag === 'br'}<svelte:element this={elementNode(node).tag} {...attributes(elementNode(node).attrs, $page.url, elementNode(node).tag === 'img')} />{:else}<svelte:element this={elementNode(node).tag} {...attributes(elementNode(node).attrs, $page.url)}><svelte:self nodes={elementNode(node).children} /></svelte:element>{/if}{/if}{/if}{/each}
