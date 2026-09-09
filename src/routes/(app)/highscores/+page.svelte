<script lang="ts">
	import { Paginator } from '@skeletonlabs/skeleton';
	import { _ } from 'svelte-i18n';

	import { goto } from '$app/navigation';
	import { page as currentPage } from '$app/stores';

	import CharactersTable from '$lib/components/ui/CharactersTable.svelte';
	import Select from '$lib/components/ui/forms/Select.svelte';
	import { vocationFilters as vocations } from '$lib/players';
	import ClassicHighscores from '$lib/themes/classic/Highscores.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;
	$: previewParameters = new URL(
		themePreviewHref($currentPage.url, '/highscores'),
		$currentPage.url,
	).searchParams;

	$: page = {
		page: data.offset,
		offset: data.offset,
		limit: data.limit,
		size: data.count,
		amounts: [50, 100, 200],
	};

	function onPageChange() {
		void goto(
			themePreviewHref(
				$currentPage.url,
				`/highscores?skill=${data.skill}&vocation=${data.vocation}&page=${page.page + 1}&limit=${page.limit}`,
			),
		);
	}

	$: skills = [
		'experience',
		'magic',
		'fist',
		'club',
		'sword',
		'axe',
		'distance',
		'shielding',
		'fishing',
		'balance',
	].map((skill) => ({ value: skill, label: $_(`skills.${skill}`) }));

	let form: HTMLFormElement;
</script>

{#if $currentPage.data.selectedTheme === 'classic'}
	<ClassicHighscores {data} />
{:else}
	<div class="flex flex-col gap-2">
		<form bind:this={form} class="flex flex-row gap-2" method="get">
			{#each Array.from(previewParameters) as [name, value]}
				<input type="hidden" {name} {value} />
			{/each}
			<Select
				name="skill"
				label={$_('skill')}
				variant="horizontal"
				on:change={() => form.requestSubmit()}
				bind:value={data.skill}>
				{#each skills as skill}
					<option value={skill.value}>{skill.label}</option>
				{/each}
			</Select>
			<Select
				name="vocation"
				label={$_('vocation')}
				variant="horizontal"
				on:change={() => form.requestSubmit()}
				bind:value={data.vocation}>
				{#each vocations as vocation}
					<option value={vocation}>{$_(`vocations.${vocation}`)}</option>
				{/each}
			</Select>
		</form>
		<CharactersTable characters={data.characters} skill={data.skill} ranked />
		<Paginator
			bind:settings={page}
			showFirstLastButtons
			amountText="per page"
			on:page={onPageChange}
			on:amount={onPageChange} />
	</div>
{/if}
