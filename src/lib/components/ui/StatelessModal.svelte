<script lang="ts">
	import { getThemeContext } from '$lib/themes/context';

	export let title: string;

	const theme = getThemeContext();
	$: Renderer = $theme.components.StatelessModal;
</script>

<svelte:component this={Renderer} {title} on:close>
	<slot />
</svelte:component>
