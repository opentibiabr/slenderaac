<script lang="ts">
	import { paginationPages } from '$lib/pagination';

	export let page: number;
	export let limit: number;
	export let count: number;
	export let href: (page: number) => string;
	export let label = 'Result pages';
	export let position: 'top' | 'bottom' = 'top';
	$: pages = paginationPages(page, Math.ceil(count / limit));
</script>

<nav
	aria-label={label}
	class="page-navigation"
	class:page-navigation--bottom={position === 'bottom'}>
	<div>
		» Pages:
		{#each pages as number}
			{#if number === null}<span>…</span>{:else if number === page}<span
					aria-current="page">{number}</span
				>{:else}<a href={href(number)}>{number}</a>{/if}{' '}
		{/each}
	</div>
	<div>» Results: {count.toLocaleString('en-US')}</div>
</nav>

<style>
	.page-navigation {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 4px 12px;
		margin: -1px -8px 3px -1px;
		padding: 1px 10px 7px 1px;
		font-size: 11.111111px;
		line-height: 13px;
		font-weight: bold;
	}
	.page-navigation--bottom {
		margin-top: 8px;
		margin-bottom: 0;
	}
	.page-navigation > div {
		white-space: nowrap;
	}
	.page-navigation a,
	.page-navigation span {
		display: inline-block;
		min-width: 15px;
		text-align: center;
	}
	@media (max-width: 767px) {
		.page-navigation > div {
			white-space: normal;
		}
	}
</style>
