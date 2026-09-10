<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import GuildCharacterRow from '$lib/components/guilds/GuildCharacterRow.svelte';
	import GuildInfoBox from '$lib/components/guilds/GuildInfoBox.svelte';
	import GuildOperations from '$lib/components/guilds/GuildOperations.svelte';
	import ClassicGuildProfile from '$lib/themes/classic/GuildProfile.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: guild = data.guild;
	$: owner = guild?.owner;
	$: isOwner = data.rankLevelInGuild >= 4;
	$: isLeader = data.rankLevelInGuild >= 3;
	$: isVice = data.rankLevelInGuild >= 2;

	function isSelf(name: string) {
		return Boolean(
			data.accountCharacters?.some((character) => character.name === name),
		);
	}
	function characterHref(name: string) {
		return themePreviewHref(
			$page.url,
			'/characters/' + encodeURIComponent(name),
		);
	}

	function isCharacerOwner(name: string) {
		return Boolean(owner?.name === name);
	}
</script>

{#if $page.data.selectedTheme === 'classic'}
	<ClassicGuildProfile {data}><slot /></ClassicGuildProfile>
{:else}
	<slot />

	{#if guild && owner}
		<div class="flex flex-col gap-2 items-center w-full">
			<h3 class="h3">{guild.name}</h3>
			{#if guild.description}
				<div class="flex data-table p-2">
					<pre
						class="font-sans font-light whitespace-pre-wrap">{guild.description}</pre>
				</div>
			{/if}
			<div class="flex flex-row w-full justify-between items-center">
				<GuildOperations name={guild.name} {isOwner} {isLeader} {isVice} />

				<GuildInfoBox
					name={guild.name}
					createdAt={guild.createdAt}
					balance={guild.balance}
					ownerName={owner.name}
					ownerHref={characterHref} />
			</div>

			<div class="table-container">
				<table class="table table-noeven table-hover table-auto">
					<thead class="border-x-4">
						<tr class="[&>th]:!p-2">
							<th class="w-20">{$_('outfit')}</th>
							<th>{$_('name')}</th>
							<th class="w-32">{$_('vocation')}</th>
							<th class="w-24">{$_('level')}</th>
						</tr>
					</thead>
					{#each guild.ranks as rank (rank.id)}
						<tr
							class="text-white border-4"
							class:bg-primary-500={rank.level === 3}
							class:bg-secondary-500={rank.level === 2}
							class:bg-tertiary-500={rank.level < 2}
							class:border-primary-500={rank.level === 3}
							class:border-secondary-500={rank.level === 2}
							class:border-tertiary-500={rank.level < 2}>
							<th colspan="5" class="text-center">{rank.name}</th>
						</tr>
						<tbody
							class="transition-all duration-300 ease-in-out border-x-4"
							class:bg-primary-200-700-token={rank.level === 3}
							class:bg-secondary-200-700-token={rank.level === 2}
							class:bg-tertiary-200-700-token={rank.level < 2}
							class:border-primary-500={rank.level === 3}
							class:border-secondary-500={rank.level === 2}
							class:border-tertiary-500={rank.level < 2}>
							{#each rank.members as character (character.id)}
								<GuildCharacterRow
									{character}
									rankLevel={rank.level}
									isOwner={isCharacerOwner(character.name)}
									isSelf={isSelf(character.name)}
									canRemovePlayer={isLeader}
									guildName={guild.name} />
							{/each}
						</tbody>
					{/each}
				</table>
			</div>

			<h4 class="h4">{$_('guilds.invited-players')}</h4>
			<div class="table-container">
				<table class="table table-noeven table-hover table-auto">
					<thead class="border-x-4">
						<tr class="[&>th]:!p-2">
							<th class="w-20">{$_('outfit')}</th>
							<th>{$_('name')}</th>
							<th class="w-32">{$_('vocation')}</th>
							<th class="w-24">{$_('level')}</th>
						</tr>
					</thead>
					<tbody class="transition-all duration-300 ease-in-out border-x-4">
						{#each guild.invited as character (character.id)}
							<GuildCharacterRow
								{character}
								rankLevel={-1}
								isOwner={isCharacerOwner(character.name)}
								isSelf={isSelf(character.name)}
								canRevokeInvite={isVice}
								isInvited
								guildName={guild.name} />
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<h5 class="h4">{data.error}</h5>
	{/if}
{/if}
