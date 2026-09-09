<script lang="ts">
	import { page } from '$app/stores';

	import { isSort, type Order, type Sort, sortHref } from '$lib/sorting';

	export let sort: Sort | null = null;
	export let order: Order = 'asc';
	export let col: string;
	let klass = '';
	export { klass as class };

	let sortLink: string | null = null;
	let sortClass = '';

	$: if (!sort || !isSort(col)) {
		sortLink = null;
	} else {
		sortLink = sortHref($page.url, col, sort, order);
	}

	$: if (sort === col) {
		sortClass = `table-sort-${order === 'asc' ? 'asc' : 'dsc'}`;
	} else {
		sortClass = '';
	}
</script>

<th class="{klass} {sortClass}">
	{#if sortLink}
		<a href={sortLink}><slot /></a>
	{:else}
		<slot />
	{/if}
</th>
