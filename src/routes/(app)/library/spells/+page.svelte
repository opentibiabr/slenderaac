<script lang="ts">
	import { page } from '$app/stores';

	import CatalogDetails from '$lib/components/ui/CatalogDetails.svelte';
	import CatalogFilters from '$lib/components/ui/CatalogFilters.svelte';
	import CatalogHeading from '$lib/components/ui/CatalogHeading.svelte';
	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { spellMana, spellSorts } from '$lib/spells';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;
	$: classic = $page.data.selectedTheme === 'classic';
	$: selected = data.selectedSpell;
	$: query = new URLSearchParams(data.filters);
	$: preview = new URL(
		themePreviewHref($page.url, '/library/spells'),
		$page.url,
	).searchParams;
	$: groups = [
		{ name: 'vocation', title: 'Vocation', values: data.vocations },
		{ name: 'group', title: 'Group', values: data.groups },
		{ name: 'type', title: 'Type', values: ['Instant', 'Rune'] },
		{ name: 'premium', title: 'Premium', values: ['no', 'yes'] },
	] as const;
	function href(id?: string) {
		const params = new URLSearchParams(query);
		if (id) params.set('spell', id);
		return themePreviewHref($page.url, `/library/spells?${params.toString()}`);
	}
	const seconds = (value: number) => `${value / 1000}s`;
	$: details = selected
		? [
				['Name:', selected.name],
				['Formula:', selected.words],
				['Vocation:', selected.vocations.join(', ') || 'All'],
				['Group:', selected.group],
				['Type:', selected.type],
				...(selected.magicType ? [['Magic Type:', selected.magicType]] : []),
				[
					'Cooldown:',
					`${seconds(selected.cooldown)} (Group: ${seconds(selected.groupCooldown)})`,
				],
				...(selected.soul ? [['Soul Points:', String(selected.soul)]] : []),
				...(selected.amount ? [['Amount:', String(selected.amount)]] : []),
				['Exp Lvl:', String(selected.level)],
				['Mana:', spellMana(selected)],
				['Premium:', selected.premium ? 'yes' : 'no'],
				...(selected.secondaryGroup
					? [
							[
								'Secondary Group:',
								`${selected.secondaryGroup} (${seconds(selected.secondaryCooldown)})`,
							],
						]
					: []),
			]
		: [];
</script>

{#if selected}
	<CatalogHeading
		title={selected.name}
		image={$page.data.themeAssets?.[`spellIcon-${selected.id}`] ?? null} />
	<CatalogDetails title="Spell Information" rows={details} />
	{#if selected.rune}
		<CatalogDetails
			title="Rune Information"
			rows={[
				['Name:', selected.name],
				['Vocation:', selected.rune.vocations.join(', ') || 'All'],
				['Group:', selected.rune.group],
				...(selected.rune.magicType
					? [['Magic Type:', selected.rune.magicType]]
					: []),
				['Exp Lvl:', String(selected.rune.level)],
				['Mag Lvl:', String(selected.rune.magicLevel)],
			]} />
	{/if}
	<div class="catalog-actions">
		<a class="btn variant-filled-primary" href={href()}>Back</a>
	</div>
{:else}
	<p class="page-intro spells-intro">
		Browse the spells available on {$page.data.serverName}. Select a name to see
		its formula and requirements.
		<br /><br />Use the search below to filter or sort this list. For more about
		magic, read the
		<a href={themePreviewHref($page.url, '/guides/manual?section=magic')}
			>manual</a
		>.
	</p>
	<PagePanel title="Spells" surface variant="list">
		<CatalogTable>
			<table
				class="classic-data-table classic-data-table--grid spells-list"
				class:table={!classic}
				aria-label="Spells">
				<thead
					><tr
						>{#each Object.values(spellSorts) as label}<th scope="col"
								>{label}</th
							>{/each}</tr
					></thead>
				<tbody>
					{#each data.spells as spell}<tr
							><td
								><a href={href(spell.id)}>{spell.name}</a>
								<span class="spell-formula">({spell.words})</span></td
							><td>{spell.group}</td><td>{spell.type}</td><td
								>{spell.level || '–'}</td
							><td>{spellMana(spell)}</td><td>{spell.premium ? 'yes' : 'no'}</td
							></tr>
					{:else}<tr
							><td colspan="6"
								>{data.configured
									? 'No spells match your search.'
									: 'No spells have been added to this server’s library yet.'}</td
							></tr
						>{/each}
				</tbody>
			</table>
		</CatalogTable>
	</PagePanel>
	<form class="catalog-search" method="get" action="/library/spells">
		{#each Array.from(preview) as [name, value]}<input
				type="hidden"
				{name}
				{value} />{/each}
		<CatalogFilters
			title="Spell Search"
			fields={groups}
			selected={data.filters}
			sorts={spellSorts} />
		<div class="catalog-actions">
			<button class="btn variant-filled-primary" type="submit">Submit</button>
		</div>
	</form>
{/if}

<style>
	.catalog-search {
		width: 100%;
	}
	.spell-formula {
		white-space: nowrap;
	}
	.catalog-actions {
		display: flex;
		justify-content: center;
		margin-top: 1em;
	}
	:global(.theme-classic) .catalog-actions {
		margin-top: 0;
	}
	:global(.theme-classic) .spells-list :is(th, td):not(:first-child) {
		text-align: center;
		white-space: nowrap;
	}
</style>
