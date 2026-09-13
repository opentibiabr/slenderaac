<script lang="ts">
	import { page } from '$app/stores';

	import PagePanel from '$lib/components/ui/PagePanel.svelte';
</script>

<PagePanel title={$page.data.title ?? 'Webshop'}><slot /></PagePanel>
