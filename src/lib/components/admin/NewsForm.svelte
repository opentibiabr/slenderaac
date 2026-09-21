<script lang="ts">
	import type { News } from '@prisma/client';
	import { markdown } from '@codemirror/lang-markdown';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { focusTrap, SlideToggle } from '@skeletonlabs/skeleton';
	// eslint-disable-next-line import/default, import/no-named-as-default, import/no-named-as-default-member
	import CodeMirror from 'svelte-codemirror-editor';

	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/forms/TextField.svelte';
	import { enhance } from '$lib/enchance';
	import { newsCategories, newsTypes } from '$lib/news';

	export let news: News | null = null;
	export let authorName: string | null = null;
	export let errors: Record<string, string[]> | null = null;
	let published = news ? news.published : false;
	let value = news ? news.content : '';
	let type = news?.type ?? 'news';
	let category = news?.category ?? 'community';

	let isFocused = true;
</script>

<form
	method="post"
	class="flex flex-col gap-2 max-w-3xl"
	use:focusTrap={isFocused}
	use:enhance>
	{#if errors?.global}
		<p class="text-xs text-error-500">{errors.global}</p>
	{/if}

	<TextField
		required
		label="Title"
		name="title"
		value={news?.title}
		errors={errors?.title} />

	<input type="hidden" name="content" bind:value />
	<div class="grid gap-3 md:grid-cols-3">
		<label class="label"
			><span>Type</span><select class="select" name="type" bind:value={type}
				>{#each newsTypes as option}<option
						value={option.value}
						selected={type === option.value}>{option.label}</option
					>{/each}</select
			></label>
		<label class="label"
			><span>Category</span><select
				class="select"
				name="category"
				bind:value={category}
				>{#each newsCategories as option}<option
						value={option.value}
						selected={category === option.value}>{option.label}</option
					>{/each}</select
			></label>
		<label class="label"
			><span>Publication date (UTC)</span><input
				class="input"
				type="date"
				name="date"
				value={(news?.created_at ?? new Date()).toISOString().slice(0, 10)}
				required /></label>
	</div>
	{#if news?.presentation}<p class="text-sm">
			The imported article layout is preserved until you change its content.
		</p>{/if}
	<div class="label">
		<span
			>Content (<a
				tabindex="-1"
				href="https://markdoc.dev/docs/syntax"
				class="anchor cursor-pointer">markdoc</a
			>)</span>
		<CodeMirror
			bind:value
			lang={markdown()}
			theme={oneDark}
			styles={{
				'&': {
					minHeight: '30rem',
					maxHeight: '75vh',
				},
			}} />
		{#if errors?.content}
			<p class="text-xs text-error-500-400-token">{errors.content}</p>
		{/if}
	</div>
	<label class="label flex flex-row items-center gap-2">
		<input
			class="hidden"
			type="checkbox"
			name="published"
			bind:checked={published} />
		<span>Publish</span>
		<SlideToggle name="slide" bind:checked={published} />
		{#if published}
			<span class="text-success-500-400-token">Yes</span>
			<span class="text-sm">(will be visible to the public)</span>
		{:else}
			<span class="text-error-500-400-token">No</span>
			<span class="text-sm">(will not be visible to the public)</span>
		{/if}
	</label>

	<div>
		{#if authorName}
			This article will be published by your main character {authorName}.
		{/if}
	</div>

	<Button type="submit">Save</Button>
</form>
