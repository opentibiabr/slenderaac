<script lang="ts">
	import { faMedal, faPerson } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';
	import { tooltip } from 'svooltip';

	import { page } from '$app/stores';

	import AnimatedOutfit from '$lib/components/ui/AnimatedOutfit.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { type Player, vocationString } from '$lib/players';
	import { themePreviewHref } from '$lib/themes/preview';

	export let highscores: Player[] = [];
	export let accountCharacters: Player[] | null = null;
</script>

<div class="card card-tertiary overflow-hidden">
	<header
		class="flex flex-row justify-center items-center gap-2 py-1 px-2 variant-filled-secondary rounded-container-token">
		<Fa icon={faMedal} />
		<h6 class="h6">{$_('highscores')}</h6>
	</header>
	<hr class="opacity-5" />
	<article class="py-2 px-4 flex flex-col gap-2">
		{#each highscores as character, i}
			<a
				href={themePreviewHref(
					$page.url,
					`/characters/${encodeURIComponent(character.name)}`,
				)}
				class="flex flex-row items-center hover:bg-tertiary-400/50 -mx-4 px-4">
				<span
					class="badge-icon variant-filled !text-white"
					class:!bg-yellow-600={i === 0}
					class:!bg-slate-500={i === 1}
					class:!bg-amber-700={i === 2}
					class:!bg-stone-600={i >= 3}>
					{i + 1}
				</span>
				<AnimatedOutfit
					outfit={character}
					alt={character.name}
					class="scale-75" />
				<span class="flex flex-col w-24">
					<span
						class="text-sm font-semibold overflow-clip overflow-ellipsis whitespace-nowrap w-full"
						use:tooltip={{ content: character.name }}>
						{character.name}
					</span>
					<span
						class="font-light text-xs flex flex-col overflow-clip overflow-ellipsis whitespace-nowrap w-full">
						<span>
							{$_('level')}: <span class="font-normal">{character.level}</span>
						</span>
						<span
							use:tooltip={{
								content: vocationString(character.vocation),
								placement: 'bottom-start',
							}}>
							{vocationString(character.vocation)}
						</span>
					</span>
				</span>
			</a>
		{/each}
	</article>
	<hr class="opacity-5" />
	<footer class="py-2 px-2">
		<Button href="/highscores" class="w-full">
			{$_('view-more')}
		</Button>
	</footer>
</div>

{#if accountCharacters}
	<div class="card card-tertiary overflow-hidden">
		<header
			class="flex flex-row justify-center items-center gap-2 py-1 px-2 variant-filled-primary rounded-container-token">
			<Fa icon={faPerson} />
			<h6 class="h6">{$_('your-characters')}</h6>
		</header>
		<hr class="opacity-5" />
		<article class="py-2 px-4 flex flex-col gap-2">
			{#each accountCharacters as character}
				<a
					href={themePreviewHref(
						$page.url,
						`/characters/${encodeURIComponent(character.name)}`,
					)}
					class="flex flex-row items-center hover:bg-tertiary-400/50 -mx-4 px-4">
					<AnimatedOutfit
						outfit={character}
						alt={character.name}
						class="scale-75" />
					<span class="flex flex-col w-24">
						<span
							class="text-sm font-semibold overflow-clip overflow-ellipsis whitespace-nowrap w-full"
							use:tooltip={{ content: character.name }}>
							{character.name}
						</span>
						<span
							class="font-light text-xs flex flex-col overflow-clip overflow-ellipsis whitespace-nowrap w-full">
							<span>
								{$_('level')}:
								<span class="font-normal">{character.level}</span>
							</span>
							<span
								use:tooltip={{
									content: vocationString(character.vocation),
									placement: 'bottom-start',
								}}>
								{vocationString(character.vocation)}
							</span>
						</span>
					</span>
				</a>
			{/each}
		</article>
	</div>
{/if}
