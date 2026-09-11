<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1 class="h1">FAQ Articles</h1>
<Button href="/admin/help/new">New Article</Button>
<div class="overflow-x-auto">
	<table class="table">
		<thead
			><tr
				><th>Title</th><th>Topic</th><th>Status</th><th>Hot Topic</th><th
					>Views</th
				></tr
			></thead
		><tbody
			>{#each data.entries as entry}<tr
					><td
						><a class="anchor" href={`/admin/help/${entry.id}`}>{entry.title}</a
						></td
					><td>{entry.topic}</td><td
						>{entry.published ? 'Published' : 'Draft'}</td
					><td>{entry.featured ? 'Yes' : 'No'}</td><td>{entry.views}</td></tr
				>{/each}</tbody>
	</table>
</div>
