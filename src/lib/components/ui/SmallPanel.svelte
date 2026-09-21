<script lang="ts">
	import { page } from '$app/stores';

	import { getThemeContext } from '$lib/themes/context';

	export let dense = false;

	const theme = getThemeContext();
	$: Renderer = $theme.components.SmallPanel;
</script>

<svelte:component this={Renderer} assets={$page.data.themeAssets} {dense}>
	<slot />
</svelte:component>
