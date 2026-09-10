<script lang="ts">
	import { page } from '$app/stores';

	import { communityFormDate } from '$lib/community-forms';
	import Button from '$lib/components/ui/Button.svelte';
	import CommunityTopics from '$lib/components/ui/CommunityTopics.svelte';
	import PageNavigation from '$lib/components/ui/PageNavigation.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import PollResults from '$lib/components/ui/PollResults.svelte';
	import { enhance } from '$lib/enchance';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	$: classic = $page.data.selectedTheme === 'classic';
	function href(id: string) {
		return themePreviewHref(
			$page.url,
			`/community/polls?${new URLSearchParams({ poll: id }).toString()}`,
		);
	}
	function pageHref(number: number) {
		return themePreviewHref($page.url, `/community/polls?page=${number}`);
	}
</script>

<div class="poll-page">
	{#if data.poll && data.results}
		<div class="page-prose">
			<p class="whitespace-pre-wrap">{data.poll.description}</p>
			<p>End: {communityFormDate(data.poll.ends_at)}</p>
		</div>
		{#if data.choice}<p role="status" class="page-intro">
				Thank you. Your vote has been received.
			</p>{:else if !data.open}<p class="page-intro">
				This poll has ended.
			</p>{/if}
		{#if data.open && !data.choice}
			{#if !classic}<h2 class="h2">{data.poll.title}</h2>{/if}
			<form method="POST" use:enhance>
				<input type="hidden" name="form_version" value={data.poll.version} />
				<PagePanel title={data.poll.title} variant="plain"
					><fieldset>
						<legend>{data.poll.title}</legend>
						{#if form?.errors.global}<p role="alert">
								{form.errors.global.join(' ')}
							</p>{/if}
						{#each data.results.options as option}<label
								class="poll-page__option"
								><input
									type="radio"
									name="option"
									value={option.id}
									required />{option.label}</label
							>{/each}
					</fieldset></PagePanel>
				<div class="poll-page__actions">
					<Button type="submit">Submit Vote</Button><Button
						href="/community/polls">Back</Button>
				</div>
			</form>
		{:else}<PollResults results={data.results} choice={data.choice} />
			<div class="poll-page__actions">
				<Button href="/community/polls">Back</Button>
			</div>{/if}
	{:else}
		<div class="poll-page__intro">
			<p><strong>Welcome to the poll section!</strong></p>
			<p>
				Let us and the {$page.data.serverName} community know what you think! Click
				on an active poll below to read the question and submit your vote.
			</p>
		</div>
		<div class="poll-page__active">
			<CommunityTopics
				title="Active Polls"
				topics={data.active}
				{href}
				compact
				empty="There are no active polls." />
		</div>
		<CommunityTopics
			title="Closed Polls"
			paged
			topics={data.closed}
			{href}
			empty="There are no closed polls.">
			<svelte:fragment slot="before"
				><PageNavigation
					bookends
					page={data.currentPage}
					limit={50}
					count={data.count}
					href={pageHref}
					label="Closed poll pages" /></svelte:fragment>
			<svelte:fragment slot="after"
				><PageNavigation
					bookends
					page={data.currentPage}
					limit={50}
					count={data.count}
					href={pageHref}
					label="Closed poll pages"
					position="bottom" /></svelte:fragment>
		</CommunityTopics>
	{/if}
</div>

<style>
	.poll-page {
		overflow-wrap: anywhere;
	}
	.poll-page__intro p {
		margin: 0 0 16px;
	}
	.poll-page__active {
		margin-bottom: 16px;
	}
	.poll-page__option {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 10px 0;
	}
	.poll-page__actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 15px;
		margin-top: 15px;
	}
	fieldset {
		padding: 5px;
		min-width: 0;
	}
	legend {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	:global(.theme-classic) .poll-page__intro {
		font:
			13.333333px/16px Verdana,
			Arial,
			sans-serif;
	}
</style>
