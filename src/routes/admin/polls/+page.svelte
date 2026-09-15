<script lang="ts">
	import { communityFormDate } from '$lib/community-forms';
	import Button from '$lib/components/ui/Button.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1 class="h1">Polls</h1>
<Button href="/admin/polls/new">Create poll</Button>
<div class="table-container">
	<table class="table">
		<thead
			><tr
				><th>Title</th><th>Published</th><th>Opening</th><th>Closing</th><th
					>Votes</th
				></tr
			></thead
		><tbody
			>{#each data.polls as poll}<tr
					><td
						><a class="anchor" href={`/admin/polls/${poll.id}`}>{poll.title}</a
						></td
					><td>{poll.published ? 'Yes' : 'No'}</td><td
						>{communityFormDate(poll.starts_at)}</td
					><td>{communityFormDate(poll.ends_at)}</td><td>{poll._count.votes}</td
					></tr
				>{:else}<tr><td colspan="5">No polls.</td></tr>{/each}</tbody>
	</table>
</div>
