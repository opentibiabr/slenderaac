<script lang="ts">
	import type { ScheduleEvent, WorldQuestResult } from '@prisma/client';

	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$lib/enchance';

	export let result: WorldQuestResult | null = null;
	export let events: ScheduleEvent[] = [];
	export let scheduled = true;
</script>

<form
	method="post"
	action="?/saveResult"
	use:enhance
	class="flex flex-col gap-4 max-w-3xl">
	{#if result}<input type="hidden" name="id" value={result.id} />{/if}
	{#if scheduled}<label class="label"
			><span>Calendar occurrence</span><select
				name="schedule_event_id"
				class="select"
				required>
				<option value="" selected={!result}>Choose an occurrence</option>
				{#each events as event}<option
						value={event.id}
						selected={event.id === result?.schedule_event_id}
						>{event.starts_at.toISOString().slice(0, 10)} – {event.ends_at
							.toISOString()
							.slice(0, 10)}{event.published ? '' : ' (draft)'}</option
					>{/each}
			</select></label
		>{/if}
	<label class="label"
		><span>Outcome</span><select name="outcome" class="select"
			><option
				value="success"
				selected={!result || result.outcome === 'success'}>Success</option
			><option value="failure" selected={result?.outcome === 'failure'}
				>Failure</option
			></select
		></label>
	<label class="label"
		><span>Occurred at (UTC)</span><input
			type="datetime-local"
			name="occurred_at"
			class="input"
			required
			value={(result?.occurred_at ?? new Date())
				.toISOString()
				.slice(0, 16)} /></label>
	<label class="flex gap-2 items-center"
		><input
			name="published"
			type="checkbox"
			class="checkbox"
			checked={result?.published ?? false} />Published</label>
	<div><Button type="submit">Save result</Button></div>
</form>
