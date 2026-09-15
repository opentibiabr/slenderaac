<script lang="ts">
	import { getThemeContext } from '$lib/themes/context';

	export let title: string;
	export let compact = false;
	export let surface = false;
	export let spacing: 'default' | 'related' | 'section' = 'default';
	export let variant:
		| 'native'
		| 'list'
		| 'form'
		| 'stack'
		| 'paged'
		| 'details'
		| 'plain'
		| 'flush'
		| 'message' = 'native';

	const theme = getThemeContext();
	$: Renderer = $theme.components.PagePanel;
</script>

<svelte:component
	this={Renderer}
	{title}
	{compact}
	{surface}
	{spacing}
	{variant}>
	<svelte:fragment slot="caption"
		><slot name="caption">{title}</slot></svelte:fragment>
	<svelte:fragment slot="before-surface"
		><slot name="before-surface" /></svelte:fragment>
	<svelte:fragment slot="after-surface"
		><slot name="after-surface" /></svelte:fragment>
	<svelte:fragment slot="decoration"
		><slot name="decoration" /></svelte:fragment>
	<slot />
</svelte:component>
