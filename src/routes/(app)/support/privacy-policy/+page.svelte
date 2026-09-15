<script lang="ts">
	import SupportDocument from '$lib/components/ui/SupportDocument.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<SupportDocument document={data.document} back />
