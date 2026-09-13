<script lang="ts">
	import { faAdd, faRemove } from '@fortawesome/free-solid-svg-icons';
	import { slide } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import SearchQuerier from '$lib/components/ui/SearchQuerier.svelte';
	import StatelessModal from '$lib/components/ui/StatelessModal.svelte';
	import { enhance } from '$lib/enchance';
	import { vocationString } from '$lib/players';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;

	$: guild = data.guild;
	$: results = data.results ?? [];

	function close() {
		guild &&
			void goto(
				themePreviewHref(
					$page.url,
					`/guilds/${encodeURIComponent(guild.name)}`,
				),
			);
	}
</script>

{#if guild}
	<StatelessModal title={$_('guilds.invite')} on:close={close}>
		<SearchQuerier label={$_('character-name')} />
		{#if results.length > 0}
			<div transition:slide class="flex flex-wrap gap-4">
				{#each results as character}
					<div transition:slide|local class="card card-surface p-2">
						<div class="flex flex-row items-center gap-2">
							<span class="font-semibold font-heading-token"
								>{character.name}</span>
							<span>{character.level}</span>
							<em>{vocationString(character.vocation)}</em>
							{#if character.guildInvtes.includes(guild.name)}
								<form
									action={themePreviewHref($page.url, '?/uninvite')}
									method="post"
									use:enhance>
									<input type="hidden" name="name" value={character.name} />
									<Button
										size="icon"
										class="text-xs h-4 w-4"
										color="error"
										iconBefore={faRemove}
										tooltip={$_('guilds.uninvite')} />
								</form>
							{:else}
								<form
									action={themePreviewHref($page.url, '?/invite')}
									method="post"
									use:enhance>
									<input type="hidden" name="name" value={character.name} />
									<Button
										size="icon"
										class="text-xs h-4 w-4"
										iconBefore={faAdd}
										tooltip={$_('guilds.invite')} />
								</form>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
		<div class="flex flex-row w-full justify-end">
			<Button
				size="sm"
				href={themePreviewHref(
					$page.url,
					`/guilds/${encodeURIComponent(guild.name)}`,
				)}>{$_('done')}</Button>
		</div>
	</StatelessModal>
{/if}
