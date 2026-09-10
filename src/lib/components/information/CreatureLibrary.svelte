<script lang="ts">
	import { page } from '$app/stores';

	import type { BoostedProps } from '$lib/boosted';
	import CatalogHeading from '$lib/components/ui/CatalogHeading.svelte';
	import CatalogNavigation from '$lib/components/ui/CatalogNavigation.svelte';
	import { type CreatureRecord, creatureSentences } from '$lib/creatures';
	import { themePreviewHref } from '$lib/themes/preview';

	import LibraryBoosted from './LibraryBoosted.svelte';

	export let entries: { id: string; name: string }[];
	export let selected: CreatureRecord | null = null;
	export let boss = false;
	export let boosted: {
		name: string | null;
		id: string | null;
		outfit: BoostedProps | null;
	};
	export let artwork: Record<string, string> | null = null;
	$: assets = artwork ?? $page.data.themeAssets;
	$: index = selected
		? entries.findIndex((entry) => entry.id === selected?.id)
		: -1;
	const href = (id: string) =>
		`${$page.url.pathname}?race=${encodeURIComponent(id)}`;
</script>

{#if selected}
	<CatalogNavigation
		artwork={assets}
		back={$page.url.pathname}
		previous={entries[index - 1] ? href(entries[index - 1].id) : null}
		next={entries[index + 1] ? href(entries[index + 1].id) : null}
		label="Creature navigation" />
	<div class="creature-detail">
		<CatalogHeading
			title={selected.name}
			image={assets?.[`creatureIcon-${selected.id}`] ?? null}
			size={64}
			variant="portrait" />
		<div class="creature-detail__description">
			{#each creatureSentences(selected) as paragraph}<p>{paragraph}</p>{/each}
		</div>
	</div>
{:else}
	<LibraryBoosted {assets} {boss} {boosted} />
	{#if entries.length}
		<div class="creature-catalog">
			{#each entries as entry}
				<div class="creature-catalog__entry">
					{#if boss}
						<div class="creature-catalog__portrait">
							{#if assets?.[`creatureIcon-${entry.id}`]}<img
									src={assets[`creatureIcon-${entry.id}`]}
									width="64"
									height="64"
									loading="lazy"
									alt="" />{/if}
						</div>
						{entry.name}
					{:else if assets?.[`creatureIcon-${entry.id}`]}
						<a
							class="creature-catalog__portrait"
							href={themePreviewHref($page.url, href(entry.id))}
							aria-label={entry.name}
							><img
								src={assets[`creatureIcon-${entry.id}`]}
								width="64"
								height="64"
								loading="lazy"
								alt="" /></a>
						<div>{entry.name}</div>
					{:else}
						<div class="creature-catalog__portrait"></div>
						<a href={themePreviewHref($page.url, href(entry.id))}
							>{entry.name}</a>
					{/if}
				</div>
			{/each}
		</div>
	{:else}<p>
			No {boss ? 'bosses' : 'creatures'} have been added to this server’s library
			yet.
		</p>{/if}
{/if}

<style>
	.creature-detail {
		margin-top: 25px;
	}
	.creature-detail__description {
		clear: both;
		margin-bottom: 35px;
	}
	.creature-catalog {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		text-align: center;
	}
	.creature-catalog__entry {
		width: 100px;
		min-height: 110px;
		margin: 0;
		overflow-wrap: anywhere;
	}
	.creature-catalog__portrait {
		display: block;
		width: 100%;
		height: 67px;
	}
	img {
		width: 64px;
		height: 64px;
		object-fit: contain;
	}
</style>
