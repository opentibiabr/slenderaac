<script lang="ts">
	import { getThemeContext } from '$lib/themes/context';

	export let title: string;
	export let compact = false;

	const theme = getThemeContext();
	$: Renderer = $theme.components.InformationTable;
</script>

<svelte:component this={Renderer} {title} {compact}>
	<slot />
</svelte:component>
