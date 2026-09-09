<script lang="ts">
	import type { PlayerDeaths } from '@prisma/client';
	import { _ } from 'svelte-i18n';

	export let death: Pick<
		PlayerDeaths,
		| 'level'
		| 'killed_by'
		| 'is_player'
		| 'mostdamage_by'
		| 'mostdamage_is_player'
		| 'unjustified'
		| 'mostdamage_unjustified'
	>;
	export let href = (name: string) => `/characters/${encodeURIComponent(name)}`;

	$: parts = $_(
		death.mostdamage_by !== death.killed_by
			? 'death-log-double'
			: 'death-log-single',
		{
			values: {
				level: death.level,
				killer: '\uFFFCkiller\uFFFC',
				mostdamage: '\uFFFCmostdamage\uFFFC',
				killerJust: death.unjustified ? ' \uFFFCunjustified\uFFFC' : '',
				mostdamageJust: death.mostdamage_unjustified
					? ' \uFFFCunjustified\uFFFC'
					: '',
				just: death.unjustified ? ' \uFFFCunjustified\uFFFC' : '',
			},
		},
	).split(/\uFFFC(killer|mostdamage|unjustified)\uFFFC/);
</script>

{#each parts as part, index}
	{#if index % 2 === 0}{part}{:else if part === 'unjustified'}<em
			class="text-error-500">{$_('unjustified')}</em
		>{:else}
		{@const name = part === 'killer' ? death.killed_by : death.mostdamage_by}
		{@const isPlayer =
			part === 'killer' ? death.is_player : death.mostdamage_is_player}
		{#if isPlayer}<a class="anchor" href={href(name)}>{name}</a
			>{:else}{name}{/if}
	{/if}
{/each}
