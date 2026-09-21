<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$lib/enchance';
	import { feedbackQuestions } from '$lib/feedback';
	import { pollOptions } from '$lib/polls';

	type CommunityForm = {
		title: string;
		description: string;
		starts_at: Date;
		ends_at: Date | null;
		published: boolean;
		questions?: unknown;
		options?: unknown;
	};
	export let feedback: CommunityForm | null = null;
	export let kind: 'feedback' | 'poll' = 'feedback';
	export let hasResponses = false;
	export let errors: Record<string, string[]> | null = null;
	export let values: Record<string, string> | null = null;
	const date = (value: Date | null | undefined) =>
		value?.toISOString().slice(0, 10) ?? '';
	$: questions = feedback
		? (kind === 'poll'
				? pollOptions(feedback.options)
				: feedbackQuestions(feedback.questions)
			)
				.map((q) => q.label)
				.join('\n')
		: kind === 'poll'
			? 'Yes\nNo'
			: 'What do you enjoy about the server?\nWhat would you like us to improve?';
	$: optionKey = kind === 'poll' ? 'options' : 'questions';
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
			readonly={kind === 'poll' && hasResponses}
			class="input"
			maxlength="255"
			required
			value={kind === 'poll' && hasResponses
				? (feedback?.title ?? '')
				: (values?.title ?? feedback?.title ?? '')} /></label>
	<label class="label"
		><span>Description</span><textarea
			name="description"
			readonly={kind === 'poll' && hasResponses}
			class="textarea"
			maxlength="16000"
			rows="4"
			value={kind === 'poll' && hasResponses
				? (feedback?.description ?? '')
				: (values?.description ?? feedback?.description ?? '')}></textarea
		></label>
	<label class="label"
		><span>{kind === 'poll' ? 'Options' : 'Questions'}</span><textarea
			name={optionKey}
			class="textarea"
			rows="6"
			maxlength="5120"
			required
			readonly={hasResponses}
			value={hasResponses ? questions : (values?.[optionKey] ?? questions)}
		></textarea
		><small
			>{kind === 'poll'
				? 'One option per line, between 2 and 20. Players choose one option.'
				: 'One question per line, up to 20. All questions are required.'}{#if hasResponses}
				{kind === 'poll'
					? 'Options are locked because this poll has votes.'
					: 'Questions are locked because this form has responses.'}{/if}</small
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
		<Button type="submit">{kind === 'poll' ? 'Save poll' : 'Save form'}</Button
		><Button href={kind === 'poll' ? '/admin/polls' : '/admin/feedback'}
			>Back</Button>
	</div>
</form>
