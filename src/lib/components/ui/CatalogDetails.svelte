<script lang="ts">
	import { getThemeContext } from '$lib/themes/context';

	export let title: string;
	export let rows: readonly (readonly string[])[];
	export let variant: 'form' | 'plain' = 'form';
	export let illustrations: { src: string; alt: string }[] = [];
	export let fitLabels = false;
	export let spacing: 'default' | 'related' | 'section' = 'default';

	const theme = getThemeContext();
	$: Renderer = $theme.components.CatalogDetails;
</script>

<svelte:component
	this={Renderer}
	{title}
	{rows}
	{variant}
	{illustrations}
	{fitLabels}
	{spacing} />
