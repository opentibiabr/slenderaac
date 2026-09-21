<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { feedbackDate } from '$lib/feedback';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1 class="h1">Feedback forms</h1>
<Button href="/admin/feedback/new">Create form</Button>
<div class="table-container">
	<table class="table">
		<thead
			><tr
				><th>Title</th><th>Published</th><th>Opening</th><th>Closing</th><th
					>Responses</th
				></tr
			></thead
		><tbody
			>{#each data.forms as feedback}<tr
					><td
						><a class="anchor" href={`/admin/feedback/${feedback.id}`}
							>{feedback.title}</a
						></td
					><td>{feedback.published ? 'Yes' : 'No'}</td><td
						>{feedbackDate(feedback.starts_at)}</td
					><td>{feedbackDate(feedback.ends_at)}</td><td
						>{feedback._count.responses}</td
					></tr
				>{:else}<tr><td colspan="5">No feedback forms.</td></tr>{/each}</tbody>
	</table>
</div>
