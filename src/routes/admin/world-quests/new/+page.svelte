<script lang="ts">
	import WorldQuestForm from '$lib/components/admin/WorldQuestForm.svelte';

	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<h1 class="h1">Create world quest</h1>
<WorldQuestForm errors={form?.errors} />
