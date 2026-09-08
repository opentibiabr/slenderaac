<script lang="ts">
	import { Paginator } from '@skeletonlabs/skeleton';
	import { _ } from 'svelte-i18n';

	import { goto } from '$app/navigation';

	import CharactersTable from '$lib/components/ui/CharactersTable.svelte';
	import Select from '$lib/components/ui/forms/Select.svelte';

	import type { PageData } from './$types';

	export let data: PageData;

	$: page = {
		page: data.page,
		offset: data.offset,
		limit: data.limit,
		size: data.count,
		amounts: [50, 100, 200],
	};

	function onPageChange() {
		void goto(
			`/highscores?skill=${data.skill}&vocation=${data.vocation}&page=${page.page}&limit=${page.limit}`,
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
	].map((skill) => $_(`skills.${skill}`));

	const vocations = ['all', 'none', 'knight', 'paladin', 'sorcerer', 'druid'];

	let form: HTMLFormElement;
</script>

<div class="flex flex-col gap-2">
	<form bind:this={form} class="flex flex-row gap-2" method="get">
		<Select
			name="skill"
			label={$_('skill')}
			variant="horizontal"
			on:change={() => form.requestSubmit()}
			bind:value={data.skill}>
			{#each skills as skill}
				<option value={skill.toLowerCase()}>{skill}</option>
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
