<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { page } from '$app/stores';

	import type { Player, PlayerWithRank } from '$lib/players';
	import type { Order, Sort } from '$lib/sorting';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { vocationString } from '$lib/players';
	import { sortHref } from '$lib/sorting';
	import { themePreviewHref } from '$lib/themes/preview';

	export let characters: (Player | PlayerWithRank)[];
	export let ranked = false;
	export let skill: string | null = null;
	export let sort: Sort | null = null;
	export let order: Order = 'asc';
	export let title = 'Characters';
	const dispatch = createEventDispatcher();
</script>

<div class="classic-native-content">
	<PagePanel {title} surface>
		<table class="classic-data-table">
			<thead
				><tr>
					{#if ranked}<th>Rank</th>{/if}
					<th
						>{#if sort}<a href={sortHref($page.url, 'name', sort, order)}
								>Name</a
							>{:else}Name{/if}</th>
					<th
						>{#if sort}<a href={sortHref($page.url, 'vocation', sort, order)}
								>Vocation</a
							>{:else}Vocation{/if}</th>
					<th
						>{#if sort}<a href={sortHref($page.url, 'level', sort, order)}
								>Level</a
							>{:else}Level{/if}</th>
					{#if skill}<th>{skill === 'experience' ? 'Experience' : skill}</th
						>{/if}
					<th>Status</th>
				</tr></thead>
			<tbody>
				{#each characters as character}
					<tr>
						{#if ranked}<td>{'rank' in character ? character.rank : ''}</td
							>{/if}
						<td
							><a
								href={themePreviewHref(
									$page.url,
									'/characters/' + encodeURIComponent(character.name),
								)}
								on:click={() => dispatch('selected')}>{character.name}</a
							></td>
						<td>{vocationString(character.vocation)}</td>
						<td>{character.level}</td>
						{#if skill}<td>{'skill' in character ? character.skill : ''}</td
							>{/if}
						<td>{character.online ? 'online' : 'offline'}</td>
					</tr>
				{:else}<tr
						><td colspan={4 + Number(ranked) + Number(!!skill)}
							>No characters found.</td
						></tr
					>{/each}
			</tbody>
		</table>
	</PagePanel>
</div>
