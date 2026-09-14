<script lang="ts">
	import { getThemeContext } from '$lib/themes/context';

	export let title: string;
	export let fields: readonly {
		name: string;
		title: string;
		values: readonly string[];
	}[];
	export let selected: Record<string, string>;
	export let sorts: Record<string, string>;

	const theme = getThemeContext();
	$: Renderer = $theme.components.CatalogFilters;
</script>

<svelte:component this={Renderer} {title} {fields} {selected} {sorts} />
