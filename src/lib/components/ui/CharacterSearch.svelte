<script lang="ts">
	import { page } from '$app/stores';

	import { getThemeContext } from '$lib/themes/context';

	import LabeledForm from './LabeledForm.svelte';
	import PagePanel from './PagePanel.svelte';

	export let variant: 'native' | 'plain' = 'native';
	export let compact = true;

	$: parameters = new URL('/characters', $page.url).searchParams;
	const theme = getThemeContext();
	$: classic = $theme.profile.presentation.pageSurface === 'ornate';
</script>

<PagePanel title="Search Character" {compact} {variant}>
	<LabeledForm
		action="/characters"
		label="Character Name:"
		fieldId="character-name"
		{parameters}
		{variant}>
		<input
			class:input={!classic}
			id="character-name"
			name="name"
			required
			value={$page.params.name ?? ''}
			autocomplete="off" />
	</LabeledForm>
</PagePanel>
