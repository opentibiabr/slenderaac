<script lang="ts">
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import CatalogDetails from '$lib/components/ui/CatalogDetails.svelte';
	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import DescriptionPanel from '$lib/components/ui/DescriptionPanel.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import SectionNavigation from '$lib/components/ui/SectionNavigation.svelte';
	import { themePreviewHref } from '$lib/themes/preview';
	import { questDate, questHref } from '$lib/world-quests';
	import { worldHref } from '$lib/worlds';

	import type { PageData } from './$types';

	export let data: PageData;
	$: classic = $page.data.selectedTheme === 'classic';
	$: quest = data.quest;
	$: groups = [
		{
			id: 'Running+World+Events',
			label: 'Running World Events',
			entries: data.quests.filter((q) => q.kind === 'event' && q.running),
			empty: 'There are currently no world events running.',
		},
		{
			id: 'Upcoming+World+Events',
			label: 'Upcoming World Events',
			entries: data.quests
				.filter((q) => q.kind === 'event' && q.next && !q.running)
				.sort(
					(a, b) => a.next!.starts_at.getTime() - b.next!.starts_at.getTime(),
				),
			empty: 'There are currently no upcoming world events.',
		},
		{
			id: 'World+Tasks',
			label: 'World Tasks',
			entries: data.quests.filter((q) => q.kind === 'task'),
			empty: 'There are currently no world tasks available.',
		},
		...(data.quests.some((q) => q.kind === 'event' && !q.running && !q.next)
			? [
					{
						id: 'Past+and+Unscheduled+Events',
						label: 'Past and Unscheduled Events',
						entries: data.quests.filter(
							(q) => q.kind === 'event' && !q.running && !q.next,
						),
						empty: '',
					},
				]
			: []),
	];
	$: details = quest
		? [
				['Name:', quest.name],
				['Description:', quest.description],
				...(quest.kind === 'event'
					? [
							['Quest Status:', quest.running ? 'running' : 'not running'],
							...(quest.running
								? [['Quest Ends:', questDate(quest.running.ends_at)]]
								: [
										[
											'Quest Begins:',
											quest.next
												? questDate(quest.next.starts_at)
												: 'Not scheduled',
										],
									]),
						]
					: []),
			]
		: [];
	function historyHref(current: URL, slug: string, resultpage: number) {
		const url = new URL(current);
		url.searchParams.set('worldquest', slug);
		url.searchParams.set('resultpage', String(resultpage));
		return url.pathname + url.search;
	}
	function namedAnchor(name: string) {
		const anchor = new URLSearchParams({ name }).toString().slice(5);
		return data.quests.filter((entry) => entry.name === name).length === 1 &&
			!groups.some((group) => group.id === anchor)
			? anchor
			: undefined;
	}
</script>

<div class="world-quests-page">
	{#if quest}
		<CatalogDetails
			variant="plain"
			spacing="section"
			fitLabels
			title={quest.kind === 'event'
				? 'World Event Details'
				: 'World Task Details'}
			rows={details} />
		{#each [{ outcome: 'success', label: 'Successful Results', count: quest.successCount }, { outcome: 'failure', label: 'Failed Results', count: quest.failureCount }] as group}
			{#if !classic}<h2 class="h2">{group.label} ({group.count})</h2>{/if}
			<PagePanel
				title={`${group.label} (${group.count})`}
				variant="stack"
				surface>
				<CatalogTable
					><table
						class="classic-data-table classic-data-table--grid"
						class:table={!classic}
						aria-label={group.label}>
						{#if group.count}<thead
								><tr
									><th scope="col">Date (UTC)</th><th scope="col">World</th></tr
								></thead
							>{/if}
						<tbody
							>{#each quest.results.filter((result) => result.outcome === group.outcome) as result}
								<tr
									><td>{questDate(result.occurred_at, true)}</td><td
										><a
											href={themePreviewHref(
												$page.url,
												worldHref(data.serverName),
											)}>{$page.data.serverName}</a
										></td
									></tr>
							{:else}<tr
									><td colspan="2"
										>{group.count
											? 'No results on this page.'
											: group.outcome === 'success'
												? 'No successful result has been recorded.'
												: 'No failed result has been recorded.'}</td
									></tr
								>{/each}</tbody>
					</table></CatalogTable>
			</PagePanel>
		{/each}
		{#if quest.pageCount > 1}<nav
				class="world-quests-page__actions"
				aria-label="Result history pages">
				{#if quest.resultPage > 1}<Button
						href={historyHref($page.url, quest.slug, quest.resultPage - 1)}
						>Previous</Button
					>{/if}
				<span>Page {quest.resultPage} of {quest.pageCount}</span>
				{#if quest.resultPage < quest.pageCount}<Button
						href={historyHref($page.url, quest.slug, quest.resultPage + 1)}
						>Next</Button
					>{/if}
			</nav>{/if}
		<div class="world-quests-page__actions">
			<Button href={questHref()}>Back</Button>
		</div>
	{:else}
		<SectionNavigation
			sections={groups.map((group) => ({
				id: group.id,
				label: group.label,
			}))} />
		<div class="page-prose world-quests-page__intro">
			<p>
				World quests bring players together for shared challenges in {$page.data
					.serverName}. Explore the events and tasks below to learn how to take
				part and follow the results achieved by your world.
			</p>
			<p>
				World events take place on scheduled dates. World tasks remain available
				independently of the event calendar. Open a quest to read its
				description and recorded results.
			</p>
		</div>
		{#each groups as group}<DescriptionPanel
				id={group.id}
				title={group.label}
				related
				plainEmpty
				anchorAliases={[group.label]}
				entries={group.entries.map((entry) => ({
					id: entry.id,
					name: entry.name,
					description: entry.description,
					href: questHref(entry.slug),
					anchor: namedAnchor(entry.name),
					footer:
						entry.kind === 'event'
							? entry.running
								? {
										label: 'Quest Ends:',
										value: questDate(entry.running.ends_at),
									}
								: entry.next
									? {
											label: 'Quest Begins:',
											value: questDate(entry.next.starts_at),
										}
									: undefined
							: undefined,
				}))}>{group.empty}</DescriptionPanel
			>{/each}
	{/if}
</div>

<style>
	.world-quests-page {
		width: 100%;
	}
	.world-quests-page__intro {
		margin: 30px 0;
	}
	.world-quests-page__actions {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		margin: 15px 0;
	}
</style>
