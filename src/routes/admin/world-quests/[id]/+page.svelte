<script lang="ts">
	import DeleteForm from '$lib/components/admin/DeleteForm.svelte';
	import WorldQuestForm from '$lib/components/admin/WorldQuestForm.svelte';
	import WorldQuestResultForm from '$lib/components/admin/WorldQuestResultForm.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { questDate, questHref } from '$lib/world-quests';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	$: errors = form && 'errors' in form ? form.errors : null;
</script>

<h1 class="h1">Edit world quest</h1>
<WorldQuestForm quest={data.quest} {errors} action="?/save" />
{#if form && 'saved' in form}<p role="status">Saved.</p>{/if}
{#if data.quest.published}<Button href={questHref(data.quest.slug)}
		>View public quest</Button
	>{/if}
{#if data.quest.kind === 'event'}
	<h2 class="h2">Calendar occurrences</h2>
	<Button href={`/admin/events/new?worldquest=${data.quest.id}`}
		>Schedule occurrence</Button>
	<ul class="list-disc pl-6">
		{#each data.quest.events as event}<li>
				<a class="anchor" href={`/admin/events/${event.id}`}
					>{questDate(event.starts_at)} – {questDate(event.ends_at)} ({event.published
						? 'published'
						: 'draft'})</a>
			</li>{:else}<li>No dates scheduled.</li>{/each}
	</ul>
{/if}
<h2 class="h2">{data.result ? 'Edit result' : 'Record result'}</h2>
{#key data.result?.id ?? data.quest.results.length}<WorldQuestResultForm
		result={data.result}
		events={data.quest.events}
		scheduled={data.quest.kind === 'event'} />{/key}
<h2 class="h2">Result history</h2>
<div class="table-container">
	<table class="table">
		<thead
			><tr
				><th>Date (UTC)</th><th>Outcome</th><th>Published</th><th>Actions</th
				></tr
			></thead
		><tbody>
			{#each data.quest.results as result}<tr
					><td>{questDate(result.occurred_at, true)}</td><td
						>{result.outcome}</td
					><td>{result.published ? 'Yes' : 'No'}</td><td
						><div class="flex gap-2">
							<Button size="sm" href={`?result=${result.id}`}>Edit</Button
							><DeleteForm
								action="?/removeResult"
								title="Delete result?"
								message="This removes the recorded outcome from the quest history."
								fields={{ id: result.id }} />
						</div></td
					></tr
				>{:else}<tr><td colspan="4">No results recorded.</td></tr>{/each}
		</tbody>
	</table>
</div>
<h2 class="h2">Delete quest</h2>
<DeleteForm
	action="?/remove"
	title="Delete world quest?"
	message="This deletes the quest, its calendar occurrences and all recorded results." />
