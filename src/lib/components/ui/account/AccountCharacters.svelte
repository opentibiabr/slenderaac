<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';
	import { _ } from 'svelte-i18n';
	import { tooltip } from 'svooltip';

	import { page } from '$app/stores';

	import AnimatedOutfit from '$lib/components/ui/AnimatedOutfit.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import MainCharacterIndicator from '$lib/components/ui/MainCharacterIndicator.svelte';
	import OnlineIndicator from '$lib/components/ui/OnlineIndicator.svelte';
	import { pronounsEnabled } from '$lib/config';
	import { getPronoun, type Player, vocationString } from '$lib/players';
	import { themePreviewHref } from '$lib/themes/preview';

	export let characters: Player[];
</script>

<div class="classic-account-section flex flex-col gap-2">
	<h3 class="h3">{$_('characters')}</h3>

	<div class="table-container">
		<table class="table table-hover table-auto">
			<thead>
				<tr class="[&>th]:!p-2">
					<th class="w-10" />
					{#if $page.data.selectedTheme !== 'classic'}<th class="w-20"
							>{$_('outfit')}</th
						>{/if}
					<th>{$_('name')}</th>
					<th class="w-48" />
				</tr>
			</thead>
			<tbody>
				{#each characters as character, i}
					<tr class="[&>td]:!align-middle">
						<td>{i + 1}</td>
						{#if $page.data.selectedTheme !== 'classic'}<td>
								<AnimatedOutfit outfit={character} alt={character.name} />
							</td>{/if}
						<td>
							<div class="flex flex-col">
								<span class="font-semibold flex flex-row gap-1 items-center">
									<OnlineIndicator online={character.online} />
									<a
										href={themePreviewHref(
											$page.url,
											`/characters/${encodeURIComponent(character.name)}`,
										)}
										class="anchor text-surface-900">
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
									{vocationString(character.vocation)} &dash; Level {character.level}
								</span>
							</div>
						</td>
						<td>
							<div class="flex flex-col gap-1 items-center">
								{#if !character.deletion}
									{#if !character.isMain}
										<form
											class="flex"
											action={themePreviewHref(
												$page.url,
												`/account/characters/set-main`,
											)}
											method="POST">
											<input type="hidden" name="name" value={character.name} />
											<button class="anchor" type="submit">
												{$_('set-as-main')}
											</button>
										</form>
									{/if}
									<a
										href={themePreviewHref(
											$page.url,
											`/account/characters/${encodeURIComponent(character.name)}/edit`,
										)}
										class="anchor"
										type="submit">
										{$_('edit')}
									</a>
									<a
										href={themePreviewHref(
											$page.url,
											`/account/characters/${encodeURIComponent(character.name)}/achievements`,
										)}
										class="anchor">Achievements</a>
									<a
										href={themePreviewHref(
											$page.url,
											`/account/characters/${encodeURIComponent(character.name)}/delete`,
										)}
										class="anchor"
										type="submit">
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
										action={themePreviewHref(
											$page.url,
											`/account/characters/${encodeURIComponent(character.name)}/delete?cancel=true`,
										)}
										method="POST">
										(<button class="anchor" type="submit"
											>{$_('undelete')}</button
										>)
									</form>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="flex flex-row justify-end">
		<Button
			href={themePreviewHref($page.url, `/account/characters/create`)}
			size="sm">{$_('new-character')}</Button>
	</div>
</div>
