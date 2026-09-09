<script lang="ts">
	import { page } from '$app/stores';

	import DescriptionPanel from '$lib/components/ui/DescriptionPanel.svelte';
	import GradeSymbols from '$lib/components/ui/GradeSymbols.svelte';
	import SectionNavigation from '$lib/components/ui/SectionNavigation.svelte';
	import { serverText } from '$lib/site-identity';

	import type { PageData } from './$types';

	export let data: PageData;
	$: identity = { name: $page.data.serverName, website: $page.url.origin };
	$: sections = [
		...data.groups.map((group) => ({
			id: `Grade+${group.grade}`,
			label: `Grade ${group.grade}`,
		})),
		{ id: 'Secret+Achievements', label: 'Secret Achievements' },
	];
</script>

<svelte:head><title>{data.title}</title></svelte:head>
<div
	class="achievements-page"
	class:achievements-page--default={$page.data.selectedTheme !== 'classic'}>
	<SectionNavigation {sections} />
	<div class="achievements-page__intro page-prose">
		<p>
			Achievements are extra goals that you can accomplish while playing {$page
				.data.serverName}. This list provides an overview of the common
			achievements available in this world. There are also secret achievements
			for you to discover yourself. Some are earned through quests, while others
			reward exploration, collecting or unusual discoveries.
		</p>
		<p>
			Each achievement awards a certain number of points when you complete it.
			The points and grades below follow the challenges available in {$page.data
				.serverName}, from everyday discoveries to the most demanding feats:
		</p>
		<ul>
			{#each data.groups as group}<li>
					<strong>Grade {group.grade}:</strong>
					{#if group.minimumPoints === null}No achievements available{:else}{group.minimumPoints}{#if group.maximumPoints !== group.minimumPoints}–{group.maximumPoints}{/if}
						points{/if}
				</li>{/each}
		</ul>
	</div>
	{#if !data.configured}<p class="page-intro">
			The achievement catalog is not available yet.
		</p>{/if}
	{#each data.groups as group}
		<DescriptionPanel
			id={`Grade+${group.grade}`}
			title={`Grade ${group.grade} Achievements`}
			entries={group.entries.map((entry) => ({
				...entry,
				name: serverText(entry.name, identity),
				description: serverText(entry.description, identity),
			}))}>
			<svelte:fragment slot="decoration"
				><GradeSymbols grade={group.grade} /></svelte:fragment>
			There are currently no public achievements of this grade available.
		</DescriptionPanel>
	{/each}
	<DescriptionPanel id="Secret+Achievements" title="Secret Achievements">
		{#if data.secretCount}In addition to the common achievements, there are <strong
				>{data.secretCount}</strong>
			secret achievements to discover in {$page.data.serverName}. Their names
			and descriptions are hidden here. Keep your eyes and ears open during your
			adventures!{:else}There are currently no secret achievements in this
			world's catalog.{/if}
	</DescriptionPanel>
</div>

<style>
	.achievements-page {
		width: 100%;
	}
	.achievements-page--default .achievements-page__intro {
		margin: 30px 0;
	}
	.achievements-page--default .achievements-page__intro p {
		margin: 0 0 16px;
	}
	.achievements-page--default .achievements-page__intro ul {
		padding-left: 40px;
		list-style: disc;
	}
</style>
