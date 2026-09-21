<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1 class="h1">Community directories</h1>
<Button href="/admin/directories/new">Create entry</Button>
<div class="table-container">
	<table class="table">
		<thead
			><tr
				><th>Name</th><th>Directory</th><th>Published</th><th>Featured</th></tr
			></thead
		><tbody
			>{#each data.entries as entry}<tr
					><td
						><a class="anchor" href={`/admin/directories/${entry.id}`}
							>{entry.name}</a
						></td
					><td>{entry.kind === 'fansite' ? 'Fansites' : 'Resellers'}</td><td
						>{entry.published ? 'Yes' : 'No'}</td
					><td>{entry.featured ? 'Yes' : 'No'}</td></tr
				>{:else}<tr><td colspan="4">No entries.</td></tr>{/each}</tbody>
	</table>
</div>
