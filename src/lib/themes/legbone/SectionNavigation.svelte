<script lang="ts">
	export let sections: { id: string; label: string }[];
	export let label = 'Page sections';
</script>

<nav class="section-navigation" aria-label={label}>
	<div class="section-navigation__default card p-3">
		{#each sections as section}
			<a href={`#${encodeURIComponent(section.id)}`}>{section.label}</a>
		{/each}
	</div>
</nav>

<style>
	.section-navigation {
		position: sticky;
		top: 0;
		z-index: 10;
		width: 100%;
		text-align: center;
	}
	.section-navigation__default {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem 1rem;
		background: rgb(var(--color-surface-700));
	}
</style>
