<script lang="ts">
	import { onMount } from 'svelte';

	import DocumentContent from '$lib/components/ui/DocumentContent.svelte';

	export let slug: string;
	export let content: string;
	onMount(() => {
		const request = new AbortController();
		void fetch('/support/get-help?/view', {
			method: 'POST',
			body: new URLSearchParams({ article: slug }),
			signal: request.signal,
		}).catch(() => {
			/* Visit statistics never interrupt reading. */
		});
		return () => request.abort();
	});
</script>

<DocumentContent {content} />
