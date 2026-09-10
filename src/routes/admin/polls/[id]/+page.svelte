<script lang="ts">
	import CommunityFormEditor from '$lib/components/admin/CommunityFormEditor.svelte';
	import PollResults from '$lib/components/ui/PollResults.svelte';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<h1 class="h1">Edit poll</h1>
{#if form && 'saved' in form && form.saved}<p role="status">Poll saved.</p>{/if}
<CommunityFormEditor
	kind="poll"
	feedback={data.poll}
	hasResponses={data.poll._count.votes > 0}
	errors={form?.errors}
	values={form && 'values' in form ? form.values : null} />
<PollResults results={data.results} />
