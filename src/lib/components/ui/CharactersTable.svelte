<script lang="ts">
	import type { Pagination } from '$lib/pagination';
	import type { Order, Sort } from '$lib/sorting';
	import { getThemeContext } from '$lib/themes/context';

	export let ranked = false;
	export let characters: unknown[];
	export let sort: Sort | null = null;
	export let order: Order = 'asc';
	export let skill: string | null = null;
	export let title = 'Characters';
	export let worldName: string | undefined = undefined;
	export let updatedAt: Date | undefined = undefined;
	export let pagination: Pagination | undefined = undefined;

	const theme = getThemeContext();
	$: Renderer = $theme.components.CharacterList;
</script>

<svelte:component
	this={Renderer}
	{characters}
	{ranked}
	{skill}
	{sort}
	{order}
	{title}
	{worldName}
	{updatedAt}
	{pagination}
	on:selected />
