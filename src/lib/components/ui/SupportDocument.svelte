<script lang="ts">
	import DocumentContent from '$lib/components/ui/DocumentContent.svelte';

	export let document: { content: string } | null;
</script>

{#if document}<DocumentContent content={document.content} />{:else}<p>
		This document has not been published by the server operator yet.
	</p>{/if}
