<script lang="ts">
	import { getThemeContext } from '$lib/themes/context';

	export let group: string | number;
	export let name: string;
	export let value: string | number;

	const theme = getThemeContext();
	$: Renderer = $theme.components.RadioChoice;
</script>

<svelte:component this={Renderer} bind:group {name} {value}>
	<slot />
</svelte:component>
