<script lang="ts">
	import { page } from '$app/stores';

	import { themePreviewHref } from '$lib/themes/preview';

	import LabeledForm from './LabeledForm.svelte';
	import PagePanel from './PagePanel.svelte';

	export let variant: 'native' | 'plain' = 'native';
	export let compact = true;

	$: parameters = new URL(themePreviewHref($page.url, '/characters'), $page.url)
		.searchParams;
</script>

<PagePanel title="Search Character" {compact} {variant}>
	<LabeledForm
		action="/characters"
		label="Character Name:"
		fieldId="character-name"
		{parameters}
		{variant}>
		<input
			class:input={$page.data.selectedTheme !== 'classic'}
			id="character-name"
			name="name"
			required
			value={$page.params.name ?? ''}
			autocomplete="off" />
	</LabeledForm>
</PagePanel>
