<script lang="ts">
	import DirectoryEntryEditor from '$lib/components/admin/DirectoryEntryEditor.svelte';

	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<h1 class="h1">Create directory entry</h1>
<DirectoryEntryEditor values={form?.values} errors={form?.errors} />
