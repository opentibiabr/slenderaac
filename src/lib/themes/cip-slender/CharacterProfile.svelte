<script lang="ts">
	import { page } from '$app/stores';

	import CharacterInventory from '$lib/components/ui/CharacterInventory.svelte';
	import CharactersTable from '$lib/components/ui/CharactersTable.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { pronounsEnabled } from '$lib/config';
	import { getPronoun, sexString, vocationString } from '$lib/players';
	import { themePreviewHref } from '$lib/themes/preview';
	import { formatDate, formatGoldCoins } from '$lib/utils';

	import type { PageData } from '../../../routes/(app)/characters/[name]/$types';

	export let data: PageData;
	$: character = data.character;
	function href(path: string, name: string) {
		return themePreviewHref($page.url, path + encodeURIComponent(name));
	}
</script>

{#if character}
	<PagePanel title="Character Information" surface>
		<table class="cip-data-table cip-data-table--details">
			<tbody>
				<tr><td>Name:</td><td>{character.name}</td></tr>
				<tr><td>Sex:</td><td>{sexString(character.sex)}</td></tr>
				{#if pronounsEnabled}<tr
						><td>Pronouns:</td><td>{getPronoun(character)}</td></tr
					>{/if}
				<tr><td>Vocation:</td><td>{vocationString(character.vocation)}</td></tr>
				<tr><td>Level:</td><td>{character.level}</td></tr>
				<tr><td>Residence:</td><td>{character.townName}</td></tr>
				{#if character.guild}<tr
						><td>Guild Membership:</td><td
							>{character.guild.rank} of
							<a href={href('/guilds/', character.guild.name)}
								>{character.guild.name}</a
							>{#if character.guild.nick}
								({character.guild.nick}){/if}</td
						></tr
					>{/if}
				<tr><td>Last Login:</td><td>{formatDate(character.lastLogin)}</td></tr>
				{#if data.balance != null}<tr
						><td>Balance:</td><td>{formatGoldCoins(data.balance)}</td></tr
					>{/if}
				{#if character.settings?.comment}<tr
						><td>Comment:</td><td><pre>{character.settings.comment}</pre></td
						></tr
					>{/if}
			</tbody>
		</table>
	</PagePanel>
	{#if data.skills}
		<PagePanel title="Skills" surface
			><table class="cip-data-table cip-data-table--details">
				<tbody>
					{#each Object.entries(data.skills) as [skill, level]}<tr
							><td>{skill}:</td><td>{level}</td></tr
						>{/each}
				</tbody>
			</table></PagePanel>
	{/if}
	{#if data.inventory}
		<PagePanel title="Inventory"
			><CharacterInventory items={data.inventory} /></PagePanel>
	{/if}
	{#if data.deaths?.length}
		<PagePanel title="Character Deaths" surface
			><table class="cip-data-table">
				<tbody>
					{#each data.deaths as death}<tr
							><td>{formatDate(death.time)}</td><td>
								Died at Level {death.level} by
								{#if death.is_player}<a
										href={href('/characters/', death.killed_by)}
										>{death.killed_by}</a
									>{:else}{death.killed_by}{/if}{#if death.unjustified}
									(unjustified){/if}
								{#if death.mostdamage_by !== death.killed_by}
									and
									{#if death.mostdamage_is_player}<a
											href={href('/characters/', death.mostdamage_by)}
											>{death.mostdamage_by}</a
										>{:else}{death.mostdamage_by}{/if}{#if death.mostdamage_unjustified}
										(unjustified){/if}{/if}.
							</td></tr
						>{/each}
				</tbody>
			</table></PagePanel>
	{/if}
	{#if data.accountCharacters?.length}<CharactersTable
			characters={data.accountCharacters} />{/if}
{:else}
	<PagePanel title="Character Information"><p>{data.error}</p></PagePanel>
{/if}
