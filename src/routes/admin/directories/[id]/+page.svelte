<script lang="ts">
	import DirectoryEntryEditor from '$lib/components/admin/DirectoryEntryEditor.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$lib/enchance';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<h1 class="h1">Edit directory entry</h1>
{#if form && 'saved' in form && form.saved}<p role="status">
		Directory entry saved.
	</p>{/if}
<DirectoryEntryEditor
	action="?/save"
	entry={data.entry}
	values={form && 'values' in form ? form.values : null}
	errors={form?.errors} />
<form
	method="POST"
	action="?/delete"
	use:enhance
	class="mt-8 flex gap-4 items-center">
	<input
		type="hidden"
		name="version"
		value={data.entry.updated_at.toISOString()} /><label
		class="flex gap-2 items-center"
		><input type="checkbox" class="checkbox" name="confirm" required />Remove
		this directory entry</label
	><Button type="submit">Delete entry</Button>
</form>
