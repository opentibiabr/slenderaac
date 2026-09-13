<script lang="ts">
	import CommunityFormEditor from '$lib/components/admin/CommunityFormEditor.svelte';

	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<h1 class="h1">Create feedback form</h1>
<CommunityFormEditor errors={form?.errors} values={form?.values} />
