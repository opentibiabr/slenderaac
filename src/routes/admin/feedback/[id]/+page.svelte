<script lang="ts">
	import FeedbackFormEditor from '$lib/components/admin/FeedbackFormEditor.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	function answer(value: unknown, key: string) {
		if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
		const text = (value as Record<string, unknown>)[key];
		return typeof text === 'string' ? text : '';
	}
</script>

<h1 class="h1">Edit feedback form</h1>
{#if form && 'saved' in form && form.saved}<p role="status">
		Feedback form saved.
	</p>{/if}
<FeedbackFormEditor
	feedback={data.feedback}
	hasResponses={data.feedback._count.responses > 0}
	values={form && 'values' in form ? form.values : null}
	errors={form?.errors} />
<h2 class="h2">Responses ({data.feedback._count.responses})</h2>
{#each data.responses as response}
	<article class="card p-4 space-y-4">
		<h3 class="h3">
			{response.submitted_at.toLocaleString('en-GB', { timeZone: 'UTC' })} UTC ·
			{response.account_id === null
				? 'Deleted account'
				: `Account #${response.account_id}`}
		</h3>
		{#each data.questions as question}<div>
				<strong>{question.label}</strong>
				<p class="whitespace-pre-wrap break-words">
					{answer(response.answers, question.id)}
				</p>
			</div>{/each}
	</article>
{:else}<p>No responses yet.</p>{/each}
{#if data.pages > 1}<nav
		class="flex gap-4 items-center"
		aria-label="Feedback response pages">
		<Button
			href={`?page=${data.currentPage - 1}`}
			disabled={data.currentPage === 1}>Previous</Button
		><span>{data.currentPage} / {data.pages}</span><Button
			href={`?page=${data.currentPage + 1}`}
			disabled={data.currentPage === data.pages}>Next</Button>
	</nav>{/if}
