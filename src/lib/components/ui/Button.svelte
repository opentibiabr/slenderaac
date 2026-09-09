<script lang="ts">
	import type { IconDefinition } from '@fortawesome/free-brands-svg-icons';
	import Fa from 'svelte-fa';
	import { tooltip } from 'svooltip';

	import { page } from '$app/stores';

	import { loading } from '$lib/stores/loading';
	import { themePreviewHref } from '$lib/themes/preview';

	export let type: 'button' | 'submit' | 'reset' | null = null;
	export let href: string | null = null;
	export let size: 'icon' | 'xs' | 'sm' | 'md' | 'lg' = 'md';
	export let variant:
		| 'filled'
		| 'ghost'
		| 'soft'
		| 'glass'
		| 'ringed'
		| 'none' = 'filled';
	export let color:
		| 'primary'
		| 'secondary'
		| 'tertiary'
		| 'error'
		| 'warning'
		| 'success'
		| 'base' = 'primary';
	export let iconBefore: IconDefinition | null = null;
	export let iconAfter: IconDefinition | null = null;
	export let disabled = false;
	let tooltipText: string | null = null;
	export { tooltipText as tooltip };
	export let noscroll = false;
	export let form: string | undefined = undefined;
	export let formaction: string | undefined = undefined;

	let klass = '';
	export { klass as class };

	let tag: 'a' | 'button';
	$: tag = href ? 'a' : 'button';
	$: role = href ? 'link' : 'button';

	// $: sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
	$: sizeClass = {
		icon: 'btn-icon',
		xs: 'text-xs btn-sm',
		sm: 'btn-sm',
		md: '',
		lg: 'btn-lg',
	}[size];
	$: colorSuffix = color !== 'base' ? `-${color}` : '';
	$: variantClass =
		variant !== 'none' ? `variant-${variant}${colorSuffix}` : '';
</script>

<svelte:element
	this={tag}
	{role}
	aria-disabled={disabled || $loading}
	tabindex="0"
	href={href ? themePreviewHref($page.url, href) : null}
	{type}
	disabled={disabled || $loading}
	data-sveltekit-noscroll={noscroll ? true : undefined}
	{form}
	{formaction}
	use:tooltip={{ content: tooltipText }}
	on:click
	class="btn gap-1 {sizeClass} {variantClass} {klass}">
	{#if iconBefore}
		<Fa icon={iconBefore} />
	{/if}
	<slot />
	{#if iconAfter}
		<Fa icon={iconAfter} />
	{/if}
</svelte:element>
