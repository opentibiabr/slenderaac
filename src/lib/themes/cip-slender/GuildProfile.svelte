<script lang="ts">
	import { page } from '$app/stores';

	import GuildCharacterRow from '$lib/components/guilds/GuildCharacterRow.svelte';
	import GuildOperations from '$lib/components/guilds/GuildOperations.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { themePreviewHref } from '$lib/themes/preview';
	import { formatDate } from '$lib/utils';

	import type { LayoutData } from '../../../routes/(app)/guilds/[name]/$types';

	export let data: LayoutData;
	$: guild = data.guild;
	$: owner = guild?.owner;
	$: isOwner = data.rankLevelInGuild >= 4;
	$: isLeader = data.rankLevelInGuild >= 3;
	$: isVice = data.rankLevelInGuild >= 2;
	function isSelf(name: string) {
		return Boolean(data.accountCharacters?.some((c) => c.name === name));
	}
</script>

<slot />
{#if guild && owner}
	<PagePanel title={guild.name} surface>
		{#if guild.description}<p class="cip-preserve-lines">
				{guild.description}
			</p>{/if}
		<table class="cip-data-table cip-data-table--details">
			<tbody>
				<tr
					><td>Leader:</td><td
						><a
							href={themePreviewHref(
								$page.url,
								'/characters/' + encodeURIComponent(owner.name),
							)}>{owner.name}</a
						></td
					></tr>
				<tr
					><td>Founded:</td><td
						>{formatDate(guild.createdAt, { short: true })}</td
					></tr>
				<tr><td>Balance:</td><td>{guild.balance.toLocaleString()} Gold</td></tr>
			</tbody>
		</table>
		<GuildOperations name={guild.name} {isOwner} {isLeader} {isVice} />
	</PagePanel>
	<PagePanel title="Guild Members" surface>
		<table class="cip-data-table">
			<thead><tr><th>Name</th><th>Vocation</th><th>Level</th></tr></thead>
			{#each guild.ranks as rank}<tbody>
					<tr><th colspan="3">{rank.name}</th></tr>
					{#each rank.members as character}<GuildCharacterRow
							{character}
							rankLevel={rank.level}
							isOwner={owner.name === character.name}
							isSelf={isSelf(character.name)}
							canRemovePlayer={isLeader}
							guildName={guild.name} />{/each}
				</tbody>{/each}
		</table>
	</PagePanel>
	<PagePanel title="Invited Characters" surface>
		<table class="cip-data-table">
			<thead><tr><th>Name</th><th>Vocation</th><th>Level</th></tr></thead
			><tbody>
				{#each guild.invited as character}<GuildCharacterRow
						{character}
						rankLevel={-1}
						isOwner={owner.name === character.name}
						isSelf={isSelf(character.name)}
						canRevokeInvite={isVice}
						isInvited
						guildName={guild.name} />{:else}<tr
						><td colspan="3">No invitations.</td></tr
					>{/each}
			</tbody>
		</table>
	</PagePanel>
{:else}<PagePanel title="Guild Information"><p>{data.error}</p></PagePanel>{/if}
