<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head><title>{data.title}</title></svelte:head>
<section class="space-y-4">
	<p>This feature is not available on this server.</p>
	<a class="anchor" href="/">Return to Latest News</a>
</section>
