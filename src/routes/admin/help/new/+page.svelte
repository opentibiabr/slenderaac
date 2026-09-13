<script lang="ts">
	import HelpEditor from '$lib/components/admin/HelpEditor.svelte';

	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<HelpEditor result={form} />
