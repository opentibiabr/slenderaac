<script lang="ts">
	import { page } from '$app/stores';

	import type { AchievementRecord } from '$lib/achievements';
	import { serverText } from '$lib/site-identity';
	import { getThemeContext } from '$lib/themes/context';

	import GradeSymbols from './GradeSymbols.svelte';
	import PagePanel from './PagePanel.svelte';

	export let achievements: AchievementRecord[];
	export let available = true;
	$: identity = { name: $page.data.serverName, website: $page.url.origin };
	const theme = getThemeContext();
	$: classic = $theme.profile.presentation.pageSurface === 'ornate';
</script>

<PagePanel title="Character Achievements" surface variant="stack">
	{#if !classic}
		<h3 class="h4">Character Achievements</h3>
	{/if}
	<table
		class="classic-data-table classic-data-table--bordered character-achievements"
		class:table={!classic}>
		<tbody>
			{#each achievements as achievement}
				<tr>
					<td class="character-achievements__grade">
						<span class="sr-only">Grade {achievement.grade}</span>
						<GradeSymbols grade={achievement.grade} inline />
					</td>
					<td>{serverText(achievement.name, identity)}</td>
				</tr>
			{:else}
				<tr
					><td
						>{available
							? 'No achievements selected for display.'
							: 'Achievement details unavailable.'}</td
					></tr>
			{/each}
		</tbody>
	</table>
</PagePanel>

<style>
	.character-achievements td {
		white-space: normal;
		overflow-wrap: anywhere;
	}
	:global(.layout-surface-ornate) .character-achievements__grade {
		width: 175px;
		box-sizing: content-box;
	}
</style>
