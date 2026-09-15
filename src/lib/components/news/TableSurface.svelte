<script lang="ts">
	import { getThemeContext } from '$lib/themes/context';

	export let assets: Record<string, string | undefined> | null | undefined;
	// The default theme keeps its responsive surface, without Classic sprite sizing.
	export let width: number | string;
	export let bordered = true;
	export let additional = false;

	const theme = getThemeContext();
	$: Renderer = $theme.components.TableSurface;
</script>

<svelte:component this={Renderer} {assets} {width} {bordered} {additional}>
	<slot />
</svelte:component>
