<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import DocumentContent from '$lib/components/ui/DocumentContent.svelte';

	export let document: { content: string } | null;
	export let back = false;
</script>

{#if document}<DocumentContent content={document.content} />{:else}<p>
		This document has not been published by the server operator yet.
	</p>{/if}
{#if back}<div class="document-back">
		<Button href="/support/legal-documents">Back</Button>
	</div>{/if}

<style>
	.document-back {
		display: flex;
		justify-content: center;
		margin: 20px 0;
	}
</style>
