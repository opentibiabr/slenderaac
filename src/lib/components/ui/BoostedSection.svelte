<script lang="ts">
	import type { BoostedProps } from '$lib/boosted';
	import Boosted from '$lib/components/ui/Boosted.svelte';

	export let boostedCreature: BoostedProps | null;
	export let boostedBoss: BoostedProps | null;
	export let stale = false;
</script>

<div class="flex flex-col-reverse items-center gap-2 mt-4 md:mt-0 md:-mb-4">
	<div class="flex flex-row gap-8">
		<Boosted boosted={boostedCreature} kind="creature" {stale} />
		<Boosted boosted={boostedBoss} kind="boss" {stale} />
	</div>
</div>
