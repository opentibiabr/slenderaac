<script lang="ts">
	import DocumentContent from '$lib/components/ui/DocumentContent.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<DocumentContent content={data.staticPage?.content ?? ''} />
