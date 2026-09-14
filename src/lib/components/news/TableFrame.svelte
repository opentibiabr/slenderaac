<script lang="ts">
	import { getThemeContext } from '$lib/themes/context';

	export let assets: Record<string, string | undefined> | null | undefined;
	// Sprite calibration dimensions apply only to the Classic frame.
	export let minWidth = 0;
	export let minHeight = 0;

	const theme = getThemeContext();
	$: Renderer = $theme.components.TableFrame;
</script>

<svelte:component this={Renderer} {assets} {minWidth} {minHeight}>
	<svelte:fragment slot="caption"><slot name="caption" /></svelte:fragment>
	<slot />
</svelte:component>
