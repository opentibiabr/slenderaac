<script lang="ts">
	import { page } from '$app/stores';

	import Markdoc from '$lib/components/markdoc/Markdoc.svelte';

	export let content: string;
</script>

<div
	class="document-content"
	class:classic={$page.data.selectedTheme === 'classic'}>
	{#key content}<Markdoc {content} />{/key}
</div>

<style>
	.classic :global(article.prose) {
		display: block;
		max-width: none;
		font:
			12px Verdana,
			Arial,
			sans-serif;
		color: inherit;
	}
	.classic :global(article.prose p) {
		margin: 12px 0;
	}
	.classic :global(article.prose h2) {
		font:
			bold 20px Verdana,
			Arial,
			sans-serif;
		margin: 16px 0;
		color: inherit;
	}
	.classic :global(article.prose h3) {
		font:
			bold 14.04px Verdana,
			Arial,
			sans-serif;
		margin: 14.04px 0;
		color: inherit;
	}
	.classic :global(article.prose ul),
	.classic :global(article.prose ol) {
		margin: 12px 0;
		padding-left: 40px;
	}
	.classic :global(article.prose li) {
		margin: 0;
		padding: 0;
	}
</style>
