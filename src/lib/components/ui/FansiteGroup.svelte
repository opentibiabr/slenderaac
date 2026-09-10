<script lang="ts">
	import { page } from '$app/stores';

	import AssetImage from '$lib/components/ui/AssetImage.svelte';
	import CatalogTable from '$lib/components/ui/CatalogTable.svelte';
	import DirectoryIcon from '$lib/components/ui/DirectoryIcon.svelte';
	import DirectoryLogo from '$lib/components/ui/DirectoryLogo.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import {
		directoryContent,
		directoryFilterHref,
		directoryLanguages,
		type DirectoryRecord,
		directorySocials,
	} from '$lib/directories';
	import TableSurface from '$lib/themes/classic/TableSurface.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	export let promoted: boolean;
	export let entries: DirectoryRecord[];
	$: title = promoted ? 'Promoted Fansites' : 'Supported Fansites';
	$: classic = $page.data.selectedTheme === 'classic';
	const contentLabel = (key: string) =>
		directoryContent[key as keyof typeof directoryContent];
	const socialLabel = (key: string) =>
		directorySocials[key as keyof typeof directorySocials];
	const languageLabel = (key: string) =>
		directoryLanguages[key as keyof typeof directoryLanguages];
</script>

{#if !classic}<h2 class="h2">{title}</h2>{/if}
<PagePanel {title} variant="stack">
	<div class="fansite-group__intro">
		<TableSurface assets={$page.data.themeAssets} width="100%"
			><p>
				{#if promoted}Promoted fansites provide regular updates and original
					content for the server community.{:else}Supported fansites share
					useful information, community resources and player-created content.{/if}
			</p></TableSurface>
	</div>
	<TableSurface assets={$page.data.themeAssets} width="100%"
		><CatalogTable
			><table
				class="classic-data-table classic-data-table--grid fansite-group__table"
				class:table={!classic}
				aria-label={title}>
				<thead
					><tr
						><th scope="col" style="width:150px">Fansite</th><th scope="col"
							>Contact</th
						><th scope="col" style="width:60px">Content</th><th
							scope="col"
							style="width:45px">Social Media</th
						><th scope="col" style="width:90px">Languages</th><th
							scope="col"
							style="width:125px">Specials</th
						><th scope="col" style="width:40px">Item</th></tr
					></thead>
				<tbody
					>{#each entries as entry}<tr>
							<td
								><a
									href={entry.url}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={entry.name}
									><DirectoryLogo
										src={$page.data.themeAssets?.[entry.details.logoAsset]}
										name={entry.name} /></a
								></td>
							<td
								>{#if entry.contactExists}<a
										href={themePreviewHref(
											$page.url,
											`/characters/${encodeURIComponent(entry.details.contactCharacter)}`,
										)}>{entry.details.contactCharacter}</a
									>{:else}{entry.details.contactCharacter || '—'}{/if}</td>
							<td
								>{#each entry.details.content as content}<DirectoryIcon
										asset={`directory-content-${content}`}
										label={contentLabel(content)} />{/each}</td>
							<td
								>{#each entry.details.socials as social}<DirectoryIcon
										asset={`directory-social-${social}`}
										label={socialLabel(social)} />{/each}</td>
							<td
								>{#each entry.details.languages as language, i}<a
										class="fansite-group__language"
										href={directoryFilterHref($page.url, 'language', language)}
										title={languageLabel(language)}
										aria-label={`Filter language: ${languageLabel(language)}`}
										>{language}</a
									>{i < entry.details.languages.length - 1
										? ', '
										: ''}{/each}</td>
							<td
								><ul>
									{#each entry.description
										.split('\n')
										.filter(Boolean) as item}<li>{item}</li>{/each}
								</ul></td>
							<td
								>{#if entry.details.itemAsset}<AssetImage
										src={$page.data.themeAssets?.[entry.details.itemAsset]}
										alt={`${entry.name} item`}
										width={32}
										height={32} />{/if}</td>
						</tr>{:else}<tr
							><td colspan="7"
								>No {promoted ? 'promoted' : 'supported'} fansites match these filters.</td
							></tr
						>{/each}</tbody>
			</table></CatalogTable
		></TableSurface>
</PagePanel>

<style>
	.fansite-group__intro {
		margin-bottom: 10px;
	}
	.fansite-group__intro p {
		margin: 0;
		padding: 34px 30px;
		font-weight: bold;
		min-height: 106px;
		display: flex;
		align-items: center;
	}
	:global(.theme-classic) .fansite-group__intro p {
		border: 1px solid #faf0d7;
		padding-left: 29px;
	}
	.fansite-group__table {
		min-width: 790px;
	}
	.fansite-group__table th {
		box-sizing: content-box;
	}
	.fansite-group__table td {
		overflow-wrap: anywhere;
	}
	.fansite-group__table ul {
		list-style: disc;
		margin: 0;
		padding-left: 13px;
	}
	:global(.theme-classic) .fansite-group__language {
		font-weight: normal !important;
		color: inherit !important;
	}
	@media (max-width: 767px) {
		.fansite-group__intro p {
			padding: 15px;
		}
	}
</style>
