<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import AnimatedOutfit from '$lib/components/ui/AnimatedOutfit.svelte';
	import CharacterAchievements from '$lib/components/ui/CharacterAchievements.svelte';
	import CharacterInventory from '$lib/components/ui/CharacterInventory.svelte';
	import CharactersTable from '$lib/components/ui/CharactersTable.svelte';
	import DeathNotice from '$lib/components/ui/DeathNotice.svelte';
	import GuildMembership from '$lib/components/ui/GuildMembership.svelte';
	import { pronounsEnabled } from '$lib/config';
	import { getPronoun, sexString, vocationString } from '$lib/players';
	import ClassicCharacterProfile from '$lib/themes/classic/CharacterProfile.svelte';
	import { themePreviewHref } from '$lib/themes/preview';
	import { formatDate, formatGoldCoins } from '$lib/utils';

	import type { PageData } from './$types';

	export let data: PageData;

	$: character = data.character;

	$: skills = data.skills
		? Object.entries(data.skills).map(([skill, level]) => [
				$_(`skills.${skill}`),
				level,
			])
		: null;
	$: inventory = data.inventory;
	function characterHref(name: string) {
		return themePreviewHref(
			$page.url,
			`/characters/${encodeURIComponent(name)}`,
		);
	}
</script>

{#if $page.data.selectedTheme === 'classic'}
	<ClassicCharacterProfile {data} />
{:else if character}
	<div class="character-profile flex flex-col gap-2 w-full min-w-0">
		<div class="data-table">
			<div
				class="flex flex-row flex-wrap justify-center gap-4 items-center px-4 sm:px-8">
				<span
					class="text-primary-700-200-token font-heading-token text-xl font-semibold max-w-full">
					{character.name}
				</span>
				<AnimatedOutfit
					class="h-20 scale-125"
					innerClass="!bottom-4"
					outfit={character}
					alt={character.name} />
				{#if pronounsEnabled}
					<em class="font-light text-xs">({getPronoun(character)})</em>
				{/if}
			</div>
			<div class="data-row">
				<dt>{$_('sex')}</dt>
				<dd>{sexString(character.sex)}</dd>
			</div>
			<div class="data-row">
				<dt>{$_('vocation')}</dt>
				<dd>{vocationString(character.vocation)}</dd>
			</div>
			<div class="data-row">
				<dt>{$_('level')}</dt>
				<dd>{character.level}</dd>
			</div>
			{#if data.balance != null}
				<div class="data-row">
					<dt>{$_('balance')}</dt>
					<dd>{formatGoldCoins(data.balance)}</dd>
				</div>
			{/if}
			<div class="data-row">
				<dt>Achievement Points</dt>
				<dd>{data.achievementPoints ?? 'Unavailable'}</dd>
			</div>
			{#if character.guild != null}
				<div class="data-row">
					<dt>{$_('guilds.membership')}</dt>
					<dd><GuildMembership guild={character.guild} /></dd>
				</div>
			{/if}
			<div class="data-row">
				<dt>{$_('residence')}</dt>
				<dd>{character.townName}</dd>
			</div>
			<div class="data-row">
				<dt>{$_('last-login')}</dt>
				<dd>
					{formatDate(character.lastLogin)}
				</dd>
			</div>
		</div>

		{#if character.settings?.comment}
			<h3 class="h4">{$_('character-comment')}</h3>
			<div class="flex data-table p-2">
				<pre class="font-sans font-light whitespace-pre-wrap">{character
						.settings.comment}</pre>
			</div>
		{/if}

		<CharacterAchievements
			achievements={data.achievements ?? []}
			available={data.achievementsAvailable} />

		{#if skills}
			<h3 class="h4">{$_('skills.skills')}</h3>
			<div class="flex flex-wrap gap-2 justify-center">
				{#each skills as [skill, level]}
					<div class="rounded-full variant-ghost-primary px-4 py-2 text-sm">
						<span class="font-semibold">{skill}:</span>
						<span>{level}</span>
					</div>
				{/each}
			</div>
		{/if}

		{#if inventory}
			<CharacterInventory items={inventory} />
		{/if}

		{#if data.deaths && data.deaths.length > 0}
			<h3 class="h4">{$_('deaths')}</h3>
			<div class="table-container">
				<table class="table table-hover table-auto">
					<thead>
						<tr class="[&>th]:!p-2">
							<th class="w-48">When</th>
							<th>By</th>
						</tr>
					</thead>
					<tbody class="transition-all duration-300 ease-in-out">
						{#each data.deaths as death}
							<tr class="[&>td]:!p-2">
								<td>{formatDate(death.time)}</td>
								<td>
									<DeathNotice {death} href={characterHref} />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		{#if data.accountCharacters && data.accountCharacters.length > 0}
			<CharactersTable characters={data.accountCharacters} />
		{/if}
	</div>
{:else}
	<h5 class="h4">{data.error}</h5>
{/if}

<style>
	.character-profile {
		overflow-wrap: anywhere;
	}
	.character-profile :is(dt, dd) {
		min-width: 0;
	}
</style>
