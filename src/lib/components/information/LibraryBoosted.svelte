<script lang="ts">
	import { page } from '$app/stores';

	import type { LibraryEntry } from '$lib/library';
	import TableFrame from '$lib/components/news/TableFrame.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	export let assets: Record<string, string | undefined> | null | undefined;
	export let boss = false;
	export let boosted: { name: string | null; entry: LibraryEntry | null };
</script>

<div class="library-boosted">
	<TableFrame {assets}>
		<svelte:fragment slot="caption"
			>Boosted {boss ? 'Boss' : 'Creature'}</svelte:fragment>
		<div class="library-boosted__content">
			<p>
				{#if boosted.entry}<img
						src={boosted.entry.image}
						alt=""
						width="64"
						height="64" />{/if}
				Today's boosted {boss ? 'boss' : 'creature'}:
				{#if boosted.entry}<a
						href={themePreviewHref(
							$page.url,
							`/library/creatures?race=${boosted.entry.race}`,
						)}>{boosted.name}</a
					>{:else}{boosted.name ?? 'None'}{/if}
			</p>
			<p>
				The daily selection shown here comes from this server. Available bonuses
				depend on its game settings.
			</p>
		</div>
	</TableFrame>
</div>

<style>
	.library-boosted {
		margin-bottom: 16px;
	}
	.library-boosted__content {
		padding: 5px;
		font-size: 13.333333px;
		display: flow-root;
	}
	.library-boosted__content p {
		margin: 1em 0;
	}
	.library-boosted__content img {
		float: right;
	}
	:global(.theme-classic) .library-boosted {
		width: calc(100% + 2px);
	}
	:global(.theme-classic .library-boosted .classic-table-frame__rail) {
		background: rgb(212 192 161);
	}
</style>
