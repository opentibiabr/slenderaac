<script lang="ts">
	import type { FeedbackForm } from '@prisma/client';

	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$lib/enchance';
	import { feedbackQuestions } from '$lib/feedback';

	export let feedback: FeedbackForm | null = null;
	export let hasResponses = false;
	export let errors: Record<string, string[]> | null = null;
	export let values: Record<string, string> | null = null;
	const date = (value: Date | null | undefined) =>
		value?.toISOString().slice(0, 10) ?? '';
	$: questions = feedback
		? feedbackQuestions(feedback.questions)
				.map((q) => q.label)
				.join('\n')
		: 'What do you enjoy about the server?\nWhat would you like us to improve?';
</script>

<form
	method="POST"
	use:enhance
	data-enhance-noreset
	class="flex flex-col gap-4 max-w-3xl">
	{#if errors?.global}<p role="alert" class="text-error-500">
			{errors.global.join(' ')}
		</p>{/if}
	<label class="label"
		><span>Title</span><input
			name="title"
			class="input"
			maxlength="255"
			required
			value={values?.title ?? feedback?.title ?? ''} /></label>
	<label class="label"
		><span>Description</span><textarea
			name="description"
			class="textarea"
			maxlength="16000"
			rows="4"
			value={values?.description ?? feedback?.description ?? ''}></textarea
		></label>
	<label class="label"
		><span>Questions</span><textarea
			name="questions"
			class="textarea"
			rows="6"
			maxlength="5120"
			required
			readonly={hasResponses}
			value={hasResponses ? questions : (values?.questions ?? questions)}
		></textarea
		><small
			>One question per line, up to 20. All questions are required.{#if hasResponses}
				Questions are locked because this form has responses.{/if}</small
		></label>
	<label class="label"
		><span>Opening date (00:00 UTC)</span><input
			name="starts_at"
			type="date"
			min="1970-01-01"
			class="input"
			required
			value={values?.starts_at ??
				(feedback ? date(feedback.starts_at) : date(new Date()))} /></label>
	<label class="label"
		><span>Closing date (00:00 UTC, optional)</span><input
			name="ends_at"
			type="date"
			min="1970-01-01"
			class="input"
			value={values?.ends_at ?? date(feedback?.ends_at)} /></label>
	<label class="flex gap-2 items-center"
		><input
			name="published"
			type="checkbox"
			class="checkbox"
			checked={values
				? values.published === 'on'
				: (feedback?.published ?? false)} />Published</label>
	<div class="flex gap-2">
		<Button type="submit">Save form</Button><Button href="/admin/feedback"
			>Back</Button>
	</div>
</form>
