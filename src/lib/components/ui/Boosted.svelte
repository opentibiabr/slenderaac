<script lang="ts">
	import { faBolt, faSkull } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { tooltip } from 'svooltip';

	import type { BoostedProps } from '$lib/boosted';
	import AnimatedOutfit from '$lib/components/ui/AnimatedOutfit.svelte';
	import { toProperCase } from '$lib/utils';

	export let kind: 'boss' | 'creature' = 'boss';
	export let boosted: BoostedProps | null = null;
	export let stale = false;
	$: label = `Boosted ${toProperCase(kind)}: ${boosted?.boostname ?? ''}${
		stale ? ' (update unavailable)' : ''
	}`;
</script>

{#if boosted}
	<div
		role="group"
		aria-label={label}
		title={label}
		class="transition-all ease-in-out duration-300 hover:scale-110 bg-surface-backdrop-token p-2 border-2 border-warning-500 ring-2 ring-primary-600/50 rounded-token shadow-md relative"
		use:tooltip={{
			content: label,
			offset: 20,
		}}>
		<div class="absolute inset-0 flex items-center justify-center">
			<Fa
				class="text-surface-900-50-token opacity-50"
				icon={kind === 'boss' ? faSkull : faBolt}
				size="32" />
		</div>
		<AnimatedOutfit
			outfit={boosted}
			alt={boosted.boostname ?? ''}
			class="scale-110">
			<div
				class="w-full h-full bg-surface-700-200-token opacity-40 rounded-full" />
		</AnimatedOutfit>
		<div
			class="absolute inset-x-0 -bottom-4 flex items-center justify-center h-8">
			<span
				class="rounded-full bg-warning-500 ring-2 ring-primary-600/50 p-0.5">
				<Fa
					class="text-success-500"
					icon={kind === 'boss' ? faSkull : faBolt}
					size="12" />
			</span>
		</div>
	</div>
{/if}
