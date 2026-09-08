<script lang="ts">
	import EventForm from '$lib/components/admin/EventForm.svelte';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<h1 class="h1">Edit event</h1>
<EventForm event={data.event} errors={form?.errors} />
