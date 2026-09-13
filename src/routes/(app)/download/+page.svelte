<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head><title>{data.title}</title></svelte:head>
{#if data.downloadHref}
	<a class="anchor" href={data.downloadHref}>Download the game client</a>
{:else}
	<p>The game client download is not available on this server.</p>
{/if}
