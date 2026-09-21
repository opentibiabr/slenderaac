<script lang="ts">
	import type { WorldQuest } from '@prisma/client';

	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$lib/enchance';

	export let quest: WorldQuest | null = null;
	export let errors: Record<string, string[]> | null = null;
	export let action = '';
</script>

<form
	method="post"
	{action}
	use:enhance
	data-enhance-noreset
	class="flex flex-col gap-4 max-w-3xl">
	{#if errors?.global}<p role="alert" class="text-error-500">
			{errors.global.join(' ')}
		</p>{/if}
	<label class="label"
		><span>Name</span><input
			name="name"
			class="input"
			maxlength="255"
			required
			value={quest?.name ?? ''} /></label>
	<label class="label"
		><span>URL identifier</span><input
			name="slug"
			class="input"
			maxlength="100"
			pattern="[a-z0-9]+(-[a-z0-9]+)*"
			required
			readonly={!!quest}
			value={quest?.slug ?? ''} /></label>
	<label class="label"
		><span>Description</span><textarea
			name="description"
			class="textarea"
			maxlength="16000"
			rows="5"
			required
			value={quest?.description ?? ''}></textarea
		></label>
	<label class="label"
		><span>Kind</span><select name="kind" class="select"
			><option value="event" selected={!quest || quest.kind === 'event'}
				>Scheduled world event</option
			><option value="task" selected={quest?.kind === 'task'}>World task</option
			></select
		></label>
	<label class="label"
		><span>Display order</span><input
			name="sort_order"
			type="number"
			class="input"
			min="-10000"
			max="10000"
			step="1"
			required
			value={quest?.sort_order ?? 0} /></label>
	<label class="flex gap-2 items-center"
		><input
			name="published"
			type="checkbox"
			class="checkbox"
			checked={quest?.published ?? false} />Published</label>
	<div class="flex gap-2">
		<Button type="submit">Save quest</Button><Button href="/admin/world-quests"
			>Back to quests</Button>
	</div>
</form>
