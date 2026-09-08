<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import { getModalStore } from '@skeletonlabs/skeleton';

	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$lib/enchance';

	import type { PageData } from './$types';

	export let data: PageData;
	const modalStore = getModalStore();
	const deleteEvent: SubmitFunction = async ({ cancel }) => {
		const confirmed = await new Promise<boolean>((resolve) => {
			modalStore.trigger({
				type: 'confirm',
				title: 'Delete event?',
				body: 'This removes the event from the schedule.',
				response: resolve,
			});
		});
		if (!confirmed) cancel();
	};
</script>

<h1 class="h1">Event Schedule</h1>
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
							<form
								action="/admin/events/{event.id}"
								method="post"
								use:enhance={deleteEvent}>
								<input type="hidden" name="_method" value="DELETE" /><Button
									type="submit"
									size="sm"
									color="error">Delete</Button>
							</form>
						</div></td>
				</tr>{:else}<tr><td colspan="4">No events yet.</td></tr>{/each}</tbody>
	</table>
</div>
