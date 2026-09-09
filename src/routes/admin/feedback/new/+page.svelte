<script lang="ts">
	import FeedbackFormEditor from '$lib/components/admin/FeedbackFormEditor.svelte';

	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<h1 class="h1">Create feedback form</h1>
<FeedbackFormEditor errors={form?.errors} values={form?.values} />
