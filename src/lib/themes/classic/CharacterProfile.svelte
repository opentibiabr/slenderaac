<script lang="ts">
	import { page } from '$app/stores';

	import CharacterAchievements from '$lib/components/ui/CharacterAchievements.svelte';
	import CharacterInventory from '$lib/components/ui/CharacterInventory.svelte';
	import CharactersTable from '$lib/components/ui/CharactersTable.svelte';
	import DeathNotice from '$lib/components/ui/DeathNotice.svelte';
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
	function characterHref(name: string) {
		return href('/characters/', name);
	}
</script>

{#if character}
	<PagePanel title="Character Information" surface variant="stack">
		<table
			class="classic-data-table classic-data-table--bordered classic-data-table--labels">
			<tbody>
				<tr><th scope="row">Name:</th><td>{character.name}</td></tr>
				<tr><th scope="row">Sex:</th><td>{sexString(character.sex)}</td></tr>
				{#if pronounsEnabled}<tr
						><th scope="row">Pronouns:</th><td>{getPronoun(character)}</td></tr
					>{/if}
				<tr
					><th scope="row">Vocation:</th><td
						>{vocationString(character.vocation)}</td
					></tr>
				<tr><th scope="row">Level:</th><td>{character.level}</td></tr>
				<tr><th scope="row">Residence:</th><td>{character.townName}</td></tr>
				<tr
					><th scope="row">Achievement Points:</th><td
						>{data.achievementPoints ?? 'Unavailable'}</td
					></tr>
				{#if character.guild}<tr
						><th scope="row">Guild Membership:</th><td
							>{character.guild.rank} of
							<a href={href('/guilds/', character.guild.name)}
								>{character.guild.name}</a
							>{#if character.guild.nick}
								({character.guild.nick}){/if}</td
						></tr
					>{/if}
				<tr
					><th scope="row">Last Login:</th><td
						>{formatDate(character.lastLogin)}</td
					></tr>
				{#if data.balance != null}<tr
						><th scope="row">Balance:</th><td
							>{formatGoldCoins(data.balance)}</td
						></tr
					>{/if}
				{#if character.settings?.comment}<tr
						><th scope="row">Comment:</th><td
							><pre>{character.settings.comment}</pre></td
						></tr
					>{/if}
			</tbody>
		</table>
	</PagePanel>
	<CharacterAchievements
		achievements={data.achievements ?? []}
		available={data.achievementsAvailable} />
	{#if data.skills}
		<PagePanel title="Skills" surface variant="stack"
			><table
				class="classic-data-table classic-data-table--bordered classic-data-table--labels">
				<tbody>
					{#each Object.entries(data.skills) as [skill, level]}<tr
							><th scope="row">{skill}:</th><td>{level}</td></tr
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
			><table class="classic-data-table">
				<tbody>
					{#each data.deaths as death}<tr
							><td>{formatDate(death.time)}</td><td>
								<DeathNotice {death} href={characterHref} />
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
