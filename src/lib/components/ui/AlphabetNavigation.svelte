<script lang="ts">
	export let anchors: ReadonlyMap<string, string>;
	export let label = 'Jump to a character initial';
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
</script>

<nav class="alphabet-navigation" aria-label={label}>
	[
	{#each letters as letter}
		{#if anchors.has(letter)}<a href={anchors.get(letter)}>{letter}</a
			>{:else}<span>{letter}</span>{/if}
	{/each} ]
</nav>

<style>
	.alphabet-navigation {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	:global(.theme-classic .classic-table-caption) .alphabet-navigation a {
		color: white;
	}
	span {
		opacity: 0.7;
	}
</style>
