<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import AnimatedOutfit from '$lib/components/ui/AnimatedOutfit.svelte';
	import CharacterInventory from '$lib/components/ui/CharacterInventory.svelte';
	import CharactersTable from '$lib/components/ui/CharactersTable.svelte';
	import GuildMembership from '$lib/components/ui/GuildMembership.svelte';
	import { pronounsEnabled } from '$lib/config';
	import { getPronoun, sexString, vocationString } from '$lib/players';
	import ClassicCharacterProfile from '$lib/themes/classic/CharacterProfile.svelte';
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
</script>

{#if $page.data.selectedTheme === 'classic'}
	<ClassicCharacterProfile {data} />
{:else if character}
	<div class="flex flex-col gap-2">
		<div class="data-table">
			<div class="flex flex-row justify-center gap-4 items-center px-8">
				<span
					class="text-primary-700-200-token font-heading-token text-xl font-semibold">
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
									{#if death.mostdamage_by !== death.killed_by}
										{@html $_('death-log-double', {
											values: {
												killer: death.is_player
													? `<a href="/characters/${death.killed_by}" class="anchor">${death.killed_by}</a>`
													: death.killed_by,
												killerJust: death.unjustified
													? '' + $_('unjustified')
													: '',
												mostdamage: death.mostdamage_is_player
													? `<a href="/characters/${death.mostdamage_by}" class="anchor">${death.mostdamage_by}</a>`
													: death.mostdamage_by,
												mostdamageJust: death.mostdamage_unjustified
													? '' + $_('unjustified')
													: '',
												level: death.level,
											},
										})}
									{:else}
										{@html $_('death-log-single', {
											values: {
												killer: death.is_player
													? `<a href="/characters/${death.killed_by} class="anchor">${death.killed_by}</a>`
													: death.killed_by,
												just: death.unjustified ? '' + $_('unjustified') : '',
												level: death.level,
											},
										})}
									{/if}
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
