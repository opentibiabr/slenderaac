<script lang="ts">
	import HelpEditor from '$lib/components/admin/HelpEditor.svelte';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<HelpEditor entry={data.entry} result={form} />
