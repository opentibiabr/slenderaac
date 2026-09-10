<script lang="ts">
	import { page } from '$app/stores';

	import DirectoryIcon from '$lib/components/ui/DirectoryIcon.svelte';
	import SmallPanel from '$lib/components/ui/SmallPanel.svelte';
	import {
		directoryContent,
		directoryFilterHref,
		directoryLanguages,
		directorySocials,
	} from '$lib/directories';

	$: groups = [
		{ key: 'language', label: 'Languages', choices: directoryLanguages },
		{ key: 'social', label: 'Social Media', choices: directorySocials },
		{ key: 'content', label: 'Content', choices: directoryContent },
	];
</script>

<div class="directory-filters">
	<SmallPanel dense>
		{#each groups as group}<div class="directory-filters__group">
				<strong>{group.label}:</strong>
				<div class="directory-filters__choices">
					<a
						class="directory-filters__all"
						class:directory-filters__selected={!$page.url.searchParams.has(
							group.key,
						)}
						href={directoryFilterHref($page.url, group.key, '')}
						aria-label={`Clear ${group.label} filters`}
						style:background-image={$page.data.themeAssets?.[
							'directory-no-filter'
						]
							? `url("${$page.data.themeAssets['directory-no-filter']}")`
							: undefined}>no filter</a
					>{#each Object.entries(group.choices) as [value, label]}<a
							href={directoryFilterHref($page.url, group.key, value)}
							aria-label={`Filter ${group.label}: ${label}`}
							aria-current={$page.url.searchParams
								.getAll(group.key)
								.includes(value)
								? 'true'
								: undefined}
							class:directory-filters__selected={$page.url.searchParams
								.getAll(group.key)
								.includes(value)}
							class:directory-filters__language={group.key === 'language'}
							>{#if group.key === 'language'}{label}{:else}<DirectoryIcon
									asset={`directory-${group.key}-${value}`}
									{label} />{/if}</a
						>{/each}
				</div>
			</div>{/each}
	</SmallPanel>
</div>

<style>
	.directory-filters {
		margin: 30px 0;
	}
	.directory-filters__group {
		display: grid;
		grid-template-columns: 130px minmax(0, 1fr);
		gap: 0;
		margin-bottom: 4px;
		min-height: 28px;
		align-items: start;
	}
	.directory-filters__group:first-child {
		min-height: 56px;
	}
	.directory-filters__group > strong {
		padding: 3px 0 0 10px;
	}
	.directory-filters__group:last-child {
		margin-bottom: 0;
	}
	.directory-filters__choices {
		display: flex;
		gap: 1px 10px;
		flex-wrap: wrap;
	}
	.directory-filters__choices a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 22px;
		margin-top: 3px;
		padding: 0;
		border: 1px solid #5f4d41;
		border-radius: 2px;
		color: inherit !important;
		font-weight: normal !important;
		text-decoration: none;
	}
	.directory-filters__choices a.directory-filters__all,
	.directory-filters__choices a.directory-filters__language {
		display: block;
		width: 98px;
		height: 27px;
		margin-top: 0;
		padding-top: 3px;
		text-align: center;
	}
	:global(.directory-filters__choices .directory-icon) {
		margin-right: 0;
	}
	.directory-filters__choices .directory-filters__all {
		padding-left: 10px;
		background-position: 0 3px;
		background-repeat: no-repeat;
	}
	.directory-filters__selected {
		background: rgb(var(--color-primary-500) / 0.3);
	}
	.directory-filters__choices a:hover {
		text-decoration: underline;
	}
	:global(.theme-classic) .directory-filters__selected {
		background: #bc9a83;
	}
	:global(.theme-classic) .directory-filters__choices a:hover {
		background: #e6d3b5;
	}
	@media (max-width: 767px) {
		.directory-filters__group {
			grid-template-columns: 1fr;
			gap: 5px;
		}
		.directory-filters__choices {
			gap: 5px;
		}
	}
</style>
