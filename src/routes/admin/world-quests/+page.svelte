<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1 class="h1">World Quests</h1>
<Button href="/admin/world-quests/new">Create world quest</Button>
<div class="table-container">
	<table class="table table-hover">
		<thead
			><tr
				><th>Name</th><th>Kind</th><th>Published</th><th>Dates</th><th
					>Results</th
				><th>Actions</th></tr
			></thead
		><tbody>
			{#each data.quests as quest}<tr
					><td>{quest.name}</td><td>{quest.kind}</td><td
						>{quest.published ? 'Yes' : 'No'}</td
					><td>{quest._count.events}</td><td>{quest._count.results}</td><td
						><Button href={`/admin/world-quests/${quest.id}`} size="sm"
							>Edit</Button
						></td
					></tr>
			{:else}<tr><td colspan="6">No world quests yet.</td></tr>{/each}
		</tbody>
	</table>
</div>
