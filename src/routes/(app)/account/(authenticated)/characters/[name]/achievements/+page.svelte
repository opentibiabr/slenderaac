<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { MAX_SHOWCASE_ACHIEVEMENTS } from '$lib/achievement-showcase';
	import Button from '$lib/components/ui/Button.svelte';
	import GradeSymbols from '$lib/components/ui/GradeSymbols.svelte';
	import StatelessModal from '$lib/components/ui/StatelessModal.svelte';
	import { enhance } from '$lib/enchance';
	import { serverText } from '$lib/site-identity';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	let selected: string[] = [];
	let loadedSelection: string[] | undefined;
	$: if (loadedSelection !== data.selected) {
		loadedSelection = data.selected;
		selected = [...data.selected];
	}
	$: identity = { name: $page.data.serverName, website: $page.url.origin };
	async function close() {
		await goto(themePreviewHref($page.url, '/account'), { noScroll: true });
	}
</script>

<StatelessModal
	title={`Achievements of ${data.characterName}`}
	on:close={close}>
	<form method="post" use:enhance class="achievement-selection">
		<p>
			Choose up to {MAX_SHOWCASE_ACHIEVEMENTS} unlocked achievements to display on
			this character's public profile. A secret achievement becomes public when you
			select it.
		</p>
		{#if form?.message}<p role="alert">{form.message}</p>{/if}
		<p aria-live="polite">
			{selected.length} of {MAX_SHOWCASE_ACHIEVEMENTS} selected
		</p>
		<table
			class="classic-data-table classic-data-table--grid"
			class:table={$page.data.selectedTheme !== 'classic'}>
			<tbody>
				{#each data.earned as achievement}
					<tr>
						<td class="achievement-selection__choice"
							><input
								type="checkbox"
								name="achievement"
								value={achievement.id.toString()}
								bind:group={selected}
								id={`achievement-${achievement.id}`}
								disabled={selected.length >= MAX_SHOWCASE_ACHIEVEMENTS &&
									!selected.includes(achievement.id.toString())} /></td>
						<td
							><label for={`achievement-${achievement.id}`}
								><strong>{serverText(achievement.name, identity)}</strong>
								<GradeSymbols grade={achievement.grade} inline /></label>
							<p class="achievement-selection__description">
								{serverText(achievement.description, identity)}
							</p></td>
					</tr>
				{:else}
					<tr
						><td
							>{data.configured
								? 'This character has not unlocked any achievements yet.'
								: 'Achievement details are unavailable. Please try again later.'}</td
						></tr>
				{/each}
			</tbody>
		</table>
		<div class="achievement-selection__actions">
			<Button disabled={!data.configured}>Save</Button><Button
				type="button"
				on:click={close}>Cancel</Button>
		</div>
	</form>
</StatelessModal>

<style>
	.achievement-selection {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.achievement-selection__choice {
		width: 24px;
	}
	.achievement-selection td {
		white-space: normal;
		overflow-wrap: anywhere;
	}
	.achievement-selection__description {
		margin: 4px 0;
	}
	.achievement-selection__actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 8px;
	}
</style>
