<script lang="ts">
	import { page } from '$app/stores';

	import type { BoostedProps } from '$lib/boosted';
	import TableFrame from '$lib/components/news/TableFrame.svelte';
	import AnimatedOutfit from '$lib/components/ui/AnimatedOutfit.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	export let assets: Record<string, string | undefined> | null | undefined;
	export let boss = false;
	export let boosted: {
		name: string | null;
		id: string | null;
		outfit: BoostedProps | null;
	};
	export let stale = false;
</script>

<div class="library-boosted">
	<TableFrame {assets}>
		<svelte:fragment slot="caption"
			>Boosted {boss ? 'Boss' : 'Creature'}</svelte:fragment>
		<div class="library-boosted__content">
			{#if boosted.outfit}
				<AnimatedOutfit
					outfit={boosted.outfit}
					alt={boosted.name ?? `Boosted ${boss ? 'boss' : 'creature'}`}
					class="library-boosted__portrait"
					innerClass="library-boosted__portrait-inner" />
			{/if}
			<p>
				Today's boosted {boss ? 'boss' : 'creature'}:
				{#if boosted.id && boosted.name && !boss}<a
						href={themePreviewHref(
							$page.url,
							`/library/creatures?race=${encodeURIComponent(boosted.id)}`,
						)}>{boosted.name}</a
					>{:else}{boosted.name ?? 'None'}{/if}
				{#if stale}
					<span>Update unavailable.</span>{/if}
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
	.library-boosted__content :global(.library-boosted__portrait) {
		float: right;
		width: 64px;
		height: 64px;
		margin-top: 1em;
	}
	.library-boosted__content :global(.library-boosted__portrait-inner) {
		top: 0;
		left: 0;
		bottom: auto;
	}
	.library-boosted__content :global(canvas) {
		width: 64px;
		height: 64px;
	}
	:global(.theme-classic) .library-boosted {
		width: calc(100% + 2px);
	}
	:global(.theme-classic .library-boosted .classic-table-frame__rail) {
		background: rgb(212 192 161);
	}
</style>
