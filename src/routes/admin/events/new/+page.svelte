<script lang="ts">
	import EventForm from '$lib/components/admin/EventForm.svelte';

	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<h1 class="h1">Create event</h1>
<EventForm errors={form?.errors} />
