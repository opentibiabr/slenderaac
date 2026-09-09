<script lang="ts">
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { enhance } from '$lib/enchance';
	import { feedbackDate } from '$lib/feedback';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	$: classic = $page.data.selectedTheme === 'classic';
</script>

<div class="feedback-page">
	{#if data.feedback}
		<p class="page-intro whitespace-pre-wrap">{data.feedback.description}</p>
		{#if data.submitted}
			<PagePanel title="Feedback received" variant="message"
				><p role="status">
					Thank you. Your feedback has been received by the {data.world} team.
				</p></PagePanel>
		{:else if !data.open}
			<PagePanel title="Feedback closed" variant="message"
				><p>This feedback form is closed.</p></PagePanel>
		{:else}
			{#if !classic}<h2 class="h2">{data.feedback.title}</h2>{/if}
			<form method="POST" use:enhance data-enhance-noreset>
				<input
					type="hidden"
					name="form_version"
					value={data.feedback.version} />
				<PagePanel title={data.feedback.title} variant="plain">
					<div class="feedback-page__questions">
						{#if form?.errors.global}<p role="alert">
								{form.errors.global.join(' ')}
							</p>{/if}
						{#each data.feedback.questions as question (question.id)}
							<label class="feedback-page__question"
								><strong>{question.label}</strong>
								<textarea
									name={`answer-${question.id}`}
									required={question.required}
									rows="5"
									maxlength="2000"
									class:textarea={!classic}
									aria-invalid={form?.errors[question.id] ? 'true' : undefined}
									aria-describedby={form?.errors[question.id]
										? `error-${question.id}`
										: undefined}
									value={form?.values[question.id] ?? ''}></textarea>
							</label>
							{#if form?.errors[question.id]}<p
									id={`error-${question.id}`}
									role="alert">
									{form.errors[question.id].join(' ')}
								</p>{/if}
						{/each}
					</div>
				</PagePanel>
				<div class="feedback-page__actions">
					<Button type="submit">Submit</Button><Button
						href="/community/feedback">Back</Button>
				</div>
			</form>
		{/if}
		{#if data.submitted || !data.open}<div class="feedback-page__actions">
				<Button href="/community/feedback">Back</Button>
			</div>{/if}
	{:else}
		<div class="page-prose feedback-page__intro">
			<p>
				Welcome to the feedback section! We are interested in your opinion about {data.world}.
				Your feedback helps us improve the server. New feedback forms will be
				added here as topics become available.
			</p>
			<p>Select a topic below to see the questions and submit your feedback.</p>
		</div>
		{#if !classic}<h2 class="h2">Active Feedback Forms</h2>{/if}
		<PagePanel title="Active Feedback Forms" variant="list" surface>
			<CatalogTable>
				<table
					class="classic-data-table classic-data-table--grid"
					class:table={!classic}
					aria-label="Active feedback forms">
					<colgroup
						><col style="width:70%" /><col style="width:30%" /></colgroup>
					<thead
						><tr
							><th scope="col">Topic</th><th
								scope="col"
								class="classic-data-cell--numeric">End</th
							></tr
						></thead>
					<tbody
						>{#each data.forms as feedback}<tr
								><td
									><a
										href={themePreviewHref(
											$page.url,
											`/community/feedback?${new URLSearchParams({ form: feedback.id }).toString()}`,
										)}>{feedback.title}</a
									></td
								><td class="classic-data-cell--numeric"
									>{feedbackDate(feedback.ends_at)}</td
								></tr
							>{:else}<tr
								><td colspan="2">There are no active feedback forms.</td></tr
							>{/each}</tbody>
				</table>
			</CatalogTable>
		</PagePanel>
	{/if}
</div>

<style>
	.feedback-page {
		width: 100%;
		overflow-wrap: anywhere;
	}
	.feedback-page__questions {
		display: grid;
		gap: 15px;
		padding: 5px;
	}
	.feedback-page__question {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.feedback-page__question textarea {
		width: 100%;
		min-height: 100px;
		resize: vertical;
	}
	.feedback-page__actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 15px;
		margin-top: 15px;
	}
	:global(.theme-classic) .feedback-page__intro {
		margin: 0;
	}
	:global(.theme-classic) .feedback-page__intro p {
		margin: 0 0 15px;
	}
	:global(.theme-classic) .feedback-page__intro p:first-child {
		margin-top: 5px;
	}
</style>
