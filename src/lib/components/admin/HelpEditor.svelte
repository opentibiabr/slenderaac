<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Checkbox from '$lib/components/ui/forms/Checkbox.svelte';
	import Select from '$lib/components/ui/forms/Select.svelte';
	import TextArea from '$lib/components/ui/forms/TextArea.svelte';
	import TextField from '$lib/components/ui/forms/TextField.svelte';
	import { helpTopics } from '$lib/help';

	export let entry: {
		title: string;
		slug: string;
		topic: string;
		content: string;
		published: boolean;
		featured: boolean;
		updated_at: Date;
	} | null = null;
	export let result:
		| { errors?: Record<string, string[]>; values?: Record<string, string> }
		| null
		| undefined = null;
	$: values = result?.values;
</script>

<h1 class="h1">{entry ? 'Edit FAQ Article' : 'New FAQ Article'}</h1>
<form action={entry ? '?/save' : undefined} method="POST" class="space-y-4">
	{#if result?.errors?.global}<p role="alert">
			{result.errors.global.join(' ')}
		</p>{/if}
	<input
		type="hidden"
		name="version"
		value={values?.version ?? entry?.updated_at.toISOString() ?? ''} />
	<TextField
		name="title"
		label="Title"
		value={values?.title ?? entry?.title ?? ''}
		required
		errors={result?.errors?.title} />
	<TextField
		name="slug"
		label="Address (lowercase words separated by hyphens)"
		value={values?.slug ?? entry?.slug ?? ''}
		required
		errors={result?.errors?.slug} />
	<Select
		name="topic"
		label="Topic"
		value={values?.topic ?? entry?.topic ?? 'account'}
		errors={result?.errors?.topic}
		>{#each Object.entries(helpTopics) as [value, label]}<option {value}
				>{label}</option
			>{/each}</Select>
	<TextArea
		name="content"
		label="Answer (Markdown)"
		value={values?.content ?? entry?.content ?? ''}
		rows={12}
		required
		errors={result?.errors?.content} />
	<p>
		Use local links and the placeholder &#123;&#123;serverName&#125;&#125; for
		the configured server name.
	</p>
	<Checkbox
		name="published"
		label="Published"
		checked={values ? values.published === 'on' : (entry?.published ?? false)}
		errors={undefined} />
	<Checkbox
		name="featured"
		label="Show in Hot Topics"
		checked={values ? values.featured === 'on' : (entry?.featured ?? false)}
		errors={undefined} />
	<div class="flex gap-3">
		<Button type="submit">Save</Button><Button href="/admin/help">Back</Button
		>{#if entry}<Button type="submit" formaction="?/delete" color="error"
				>Delete</Button
			>{/if}
	</div>
</form>
