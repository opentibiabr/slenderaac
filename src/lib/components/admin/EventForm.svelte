<script lang="ts">
	import type { ScheduleEvent } from '@prisma/client';

	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$lib/enchance';

	export let event: ScheduleEvent | null = null;
	export let errors: Record<string, string[]> | null = null;
	export let quests: { id: string; name: string }[] = [];
	export let selectedQuest = '';
	let worldQuestId = '';
	$: worldQuestId = event?.world_quest_id ?? selectedQuest;
	const today = new Date().toISOString().slice(0, 10);
</script>

<form method="post" use:enhance class="flex flex-col gap-4 max-w-3xl">
	{#if errors?.global}<p role="alert" class="text-error-500">
			{errors.global.join(' ')}
		</p>{/if}
	<label class="label"
		><span>World quest</span><select
			name="world_quest_id"
			class="select"
			bind:value={worldQuestId}>
			<option value="">Independent calendar event</option>
			{#each quests as quest}<option value={quest.id}>{quest.name}</option
				>{/each}
		</select></label>
	{#if worldQuestId}<p class="text-sm">
			Leave title or description empty to use the quest's shared text.
		</p>{/if}
	<label class="label"
		><span>Title</span><input
			class="input"
			name="title"
			required={!worldQuestId}
			maxlength="255"
			value={event?.title ?? ''} /></label>
	<label class="label"
		><span>Description</span><textarea
			class="textarea"
			name="description"
			rows="5"
			maxlength="16000"
			value={event?.description ?? ''}></textarea
		></label>
	<div class="grid gap-3 md:grid-cols-2">
		<label class="label"
			><span>Starts on (UTC)</span><input
				class="input"
				name="starts_at"
				type="date"
				required
				value={event?.starts_at.toISOString().slice(0, 10) ?? today} /></label>
		<label class="label"
			><span>Ends on (UTC)</span><input
				class="input"
				name="ends_at"
				type="date"
				required
				value={event?.ends_at.toISOString().slice(0, 10) ?? today} /></label>
		<label class="label"
			><span>Color</span><input
				class="input"
				name="color"
				type="color"
				value={event?.color ?? '#24657b'} /></label>
		<label class="label"
			><span>Display order</span><input
				class="input"
				name="sort_order"
				type="number"
				min="-10000"
				max="10000"
				step="1"
				required
				value={event?.sort_order ?? 0} /></label>
	</div>
	<p class="text-sm">
		Dates include both endpoints. The calendar marks the first and last day with
		an asterisk.
	</p>
	<label class="flex gap-2 items-center"
		><input
			class="checkbox"
			name="seasonal"
			type="checkbox"
			checked={event?.seasonal ?? false} />Show as a seasonal icon</label>
	<label class="flex gap-2 items-center"
		><input
			class="checkbox"
			name="published"
			type="checkbox"
			checked={event?.published ?? false} />Published</label>
	<div class="flex gap-2">
		<Button type="submit">Save</Button><Button href="/admin/events"
			>Cancel</Button>
	</div>
</form>
