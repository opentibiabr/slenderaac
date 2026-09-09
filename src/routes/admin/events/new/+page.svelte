<script lang="ts">
	import EventForm from '$lib/components/admin/EventForm.svelte';

	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;
</script>

<h1 class="h1">Create event</h1>
<EventForm
	errors={form?.errors}
	quests={data.quests}
	selectedQuest={data.selectedQuest} />
