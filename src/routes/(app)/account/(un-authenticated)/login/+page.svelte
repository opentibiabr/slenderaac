<script lang="ts">
	import { getThemeContext } from '$lib/themes/context';

	import type { ActionData } from './$types';

	export let form: ActionData;

	const theme = getThemeContext();
	$: Renderer = $theme.components.Login;
</script>

<svelte:component this={Renderer} {form} />
