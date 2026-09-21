<script lang="ts">
	import SmallBox from './SmallBox.svelte';

	export let sections: { id: string; label: string }[];
	export let label = 'Page sections';
	export let assets: Record<string, string | undefined> | null | undefined;
</script>

<nav class="section-navigation" aria-label={label}>
	<SmallBox {assets}>
		{#each sections as section}
			<span class="section-navigation__link">
				[<a href={`#${encodeURIComponent(section.id)}`}>{section.label}</a>]
			</span>{' '}
		{/each}
	</SmallBox>
</nav>

<style>
	.section-navigation {
		position: sticky;
		top: 0;
		z-index: 10;
		width: 100%;
		text-align: center;
	}
	.section-navigation__link {
		white-space: nowrap;
	}
</style>
