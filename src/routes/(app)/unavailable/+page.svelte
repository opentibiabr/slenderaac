<script lang="ts">
	import { page } from '$app/stores';

	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head><title>{data.title}</title></svelte:head>
<section class="space-y-4">
	<p>This feature is not available on this server.</p>
	<a class="anchor" href={themePreviewHref($page.url, '/')}
		>Return to Latest News</a>
</section>
