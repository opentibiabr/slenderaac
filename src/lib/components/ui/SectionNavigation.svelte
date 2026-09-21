<script lang="ts">
	import { page } from '$app/stores';

	import { getThemeContext } from '$lib/themes/context';

	export let sections: { id: string; label: string }[];
	export let label = 'Page sections';

	const theme = getThemeContext();
	$: Renderer = $theme.components.SectionNavigation;
</script>

<svelte:component
	this={Renderer}
	{sections}
	{label}
	assets={$page.data.themeAssets} />
