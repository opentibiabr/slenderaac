<script lang="ts">
	import { page } from '$app/stores';

	export let grade: number;
</script>

<span class="grade-symbols" aria-hidden="true"
	>{#each Array(grade) as _}{#if $page.data.themeAssets?.achievementGrade}<img
				src={$page.data.themeAssets.achievementGrade}
				alt=""
				width="18"
				height="18" />{:else}★{/if}{/each}</span>

<style>
	.grade-symbols {
		display: inline-flex;
		vertical-align: top;
		gap: 2px;
		margin-left: 10px;
		height: 16px;
	}
	:global(.theme-classic) img {
		width: 18px;
		height: 18px;
		max-width: none;
	}
</style>
