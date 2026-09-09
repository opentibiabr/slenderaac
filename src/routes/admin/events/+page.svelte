<script lang="ts">
	import DeleteForm from '$lib/components/admin/DeleteForm.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
	export let form: { errors?: Record<string, string[]> } | null = null;
</script>

<h1 class="h1">Event Schedule</h1>
{#if form?.errors?.global}<p role="alert" class="text-error-500">
		{form.errors.global.join(' ')}
	</p>{/if}
<Button href="/admin/events/new">Create event</Button>
<div class="table-container">
	<table class="table table-hover">
		<thead
			><tr
				><th>Title</th><th>Dates (UTC)</th><th>Published</th><th>Actions</th
				></tr
			></thead>
		<tbody
			>{#each data.events as event (event.id)}<tr>
					<td>{event.title}{event.seasonal ? ' (seasonal)' : ''}</td>
					<td
						>{event.starts_at.toISOString().slice(0, 10)} – {event.ends_at
							.toISOString()
							.slice(0, 10)}</td>
					<td>{event.published ? 'Yes' : 'No'}</td>
					<td
						><div class="flex gap-2">
							<Button href="/admin/events/{event.id}" size="sm">Edit</Button>
							<DeleteForm
								action={`/admin/events/${event.id}`}
								title="Delete event?"
								message="This removes the event from the schedule. Linked quest results must be removed first."
								fields={{ _method: 'DELETE' }} />
						</div></td>
				</tr>{:else}<tr><td colspan="4">No events yet.</td></tr>{/each}</tbody>
	</table>
</div>
