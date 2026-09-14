<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';
	import { _ } from 'svelte-i18n';
	import { tooltip } from 'svooltip';

	import { page } from '$app/stores';

	import AnimatedOutfit from '$lib/components/ui/AnimatedOutfit.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import MainCharacterIndicator from '$lib/components/ui/MainCharacterIndicator.svelte';
	import OnlineIndicator from '$lib/components/ui/OnlineIndicator.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { pronounsEnabled } from '$lib/config';
	import { getPronoun, type Player, vocationString } from '$lib/players';

	export let characters: Player[];
	$: classic = $page.data.selectedTheme === 'classic';
	let selectedCharacterId: number | undefined;
	$: if (
		!characters.some((character) => character.id === selectedCharacterId)
	) {
		selectedCharacterId = characters[0]?.id;
	}
</script>

{#if !classic}<h3 class="h3">{$_('characters')}</h3>{/if}

<PagePanel title={$_('characters')} variant="list" surface>
	<CatalogTable>
		<div class:table-container={!classic}>
			<table
				class="account-characters"
				class:table={!classic}
				class:table-hover={!classic}
				class:classic-data-table={classic}
				class:classic-data-table--grid={classic}
				aria-label={$_('characters')}>
				<thead>
					<tr>
						<th scope="col" class="account-characters__number"
							><span class="sr-only">#</span></th>
						<th scope="col" class="account-characters__outfit"
							>{$_('outfit')}</th>
						<th scope="col">{$_('name')}</th>
						{#if classic}<th scope="col" class="account-characters__status"
								>Status</th
							>{/if}
						<th scope="col" class="account-characters__actions"
							><span class="sr-only">{$_('account.character-actions')}</span
							></th>
					</tr>
				</thead>
				<tbody>
					{#each characters as character, i (character.id)}
						<tr
							class:account-characters__selected={classic &&
								selectedCharacterId === character.id}
							on:pointerdown={() => {
								if (classic) selectedCharacterId = character.id;
							}}>
							<td class="account-characters__index">
								{#if classic}
									<button
										class="account-characters__select"
										type="button"
										aria-label={$_('account.select-character', {
											values: { name: character.name },
										})}
										aria-expanded={selectedCharacterId === character.id}
										aria-controls={`character-actions-${character.id}`}
										on:click={() => (selectedCharacterId = character.id)}
										>{i + 1}.</button>
								{:else}{i + 1}{/if}
							</td>
							<td>
								<AnimatedOutfit outfit={character} alt={character.name} />
							</td>
							<td class="account-characters__identity">
								<div class="flex flex-col">
									<span class="font-semibold flex flex-row gap-1 items-center">
										{#if !classic}<OnlineIndicator
												online={character.online} />{/if}
										<a
											href={`/characters/${encodeURIComponent(character.name)}`}
											class="anchor account-characters__name">
											{character.name}
										</a>
										{#if pronounsEnabled}
											<em class="font-light">({getPronoun(character)})</em>
										{/if}
										{#if character.isMain}
											<MainCharacterIndicator />
										{/if}
									</span>
									<span class="text-xs">
										{vocationString(character.vocation)} &dash; {$_('level')}
										{character.level}
									</span>
								</div>
							</td>
							{#if classic}<td><OnlineIndicator online={character.online} /></td
								>{/if}
							<td>
								<div
									id={`character-actions-${character.id}`}
									class="account-characters__links"
									hidden={classic && selectedCharacterId !== character.id}>
									{#if !character.deletion}
										{#if !character.isMain}
											<form
												class="flex"
												action={`/account/characters/set-main`}
												method="POST">
												<input
													type="hidden"
													name="name"
													value={character.name} />
												<button class="anchor" type="submit">
													{$_('set-as-main')}
												</button>
											</form>
										{/if}
										<a
											href={`/account/characters/${encodeURIComponent(character.name)}/edit`}
											class="anchor"
											data-sveltekit-noscroll={!classic || undefined}>
											{$_('edit')}
										</a>
										<a
											href={`/account/characters/${encodeURIComponent(character.name)}/achievements`}
											class="anchor"
											data-sveltekit-noscroll={!classic || undefined}
											>Achievements</a>
										<a
											href={`/account/characters/${encodeURIComponent(character.name)}/delete`}
											class="anchor"
											data-sveltekit-noscroll={!classic || undefined}>
											{$_('delete')}
										</a>
									{:else}
										<span
											class="text-error-600"
											use:tooltip={{
												content: `"${
													character.name
												}"" will be deleted in ${formatDistanceToNow(
													Number(character.deletion),
												)}`,
											}}>
											{$_('deleted')}
										</span>
										<form
											class="flex"
											action={`/account/characters/${encodeURIComponent(character.name)}/delete?cancel=true`}
											method="POST">
											(<button class="anchor" type="submit"
												>{$_('undelete')}</button
											>)
										</form>
									{/if}
								</div>
							</td>
						</tr>
					{:else}
						<tr
							><td colspan={classic ? 5 : 4}>{$_('account.no-characters')}</td
							></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</CatalogTable>

	<div slot="after-surface" class="flex justify-end mt-2">
		<Button href={`/account/characters/create`} size="sm" noscroll={!classic}
			>{$_('new-character')}</Button>
	</div>
</PagePanel>

<style>
	.account-characters {
		width: 100%;
	}
	.account-characters :is(th, td) {
		white-space: normal;
		vertical-align: middle;
	}
	.account-characters__number {
		width: 2rem;
	}
	.account-characters__outfit {
		width: 5rem;
	}
	.account-characters__status {
		width: 15%;
	}
	.account-characters__actions {
		width: 10rem;
	}
	.account-characters__links {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		white-space: nowrap;
	}
	.account-characters__links[hidden] {
		display: none;
	}
	:global(.theme-classic) .account-characters__links {
		gap: 0;
	}
	:global(.theme-classic)
		.account-characters__links:not([hidden])
		> :is(a, form)::before {
		content: '[';
		color: rgb(90 40 0);
		font-weight: normal;
	}
	:global(.theme-classic)
		.account-characters__links:not([hidden])
		> :is(a, form)::after {
		content: ']';
		color: rgb(90 40 0);
		font-weight: normal;
	}
	:global(.theme-classic) .account-characters tbody tr {
		height: 56px;
		cursor: pointer;
	}
	:global(.theme-classic .classic-native-content)
		.account-characters
		tbody
		tr:nth-child(even) {
		background: rgb(213 192 161);
	}
	:global(.theme-classic .classic-native-content)
		.account-characters
		tbody
		tr:hover {
		background: rgb(255 237 209);
	}
	:global(.theme-classic .classic-native-content) .account-characters__name {
		font-size: 13.333333px;
		font-weight: normal;
		color: inherit;
		text-decoration: none;
	}
	:global(.theme-classic) .account-characters__identity {
		white-space: nowrap;
	}
	:global(.theme-classic) .account-characters__identity > div {
		gap: 4px;
	}
	:global(.theme-classic .classic-native-content)
		.account-characters__selected
		.account-characters__name {
		font-size: 17.333333px;
		font-weight: bold;
	}
	:global(.theme-classic) .account-characters__selected {
		font-weight: bold;
	}
	.account-characters__select {
		color: inherit;
		font: inherit;
		padding: 4px 0;
	}
	.account-characters__select:focus-visible {
		outline: 1px solid currentColor;
		outline-offset: 2px;
	}
	:global(.theme-classic) .account-characters :is(th, td) {
		vertical-align: middle;
	}
	:global(.theme-classic) .account-characters__number {
		width: 28px;
	}
	:global(.theme-classic) .account-characters .account-characters__index {
		padding: 4px 2px 2px;
		text-align: center;
	}
	:global(.theme-classic) .account-characters__status {
		width: 111px;
	}
	:global(.theme-classic) .account-characters__actions {
		width: 130px;
	}
</style>
