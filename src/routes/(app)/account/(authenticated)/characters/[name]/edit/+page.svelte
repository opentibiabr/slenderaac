<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import Checkbox from '$lib/components/ui/forms/Checkbox.svelte';
	import Select from '$lib/components/ui/forms/Select.svelte';
	import TextArea from '$lib/components/ui/forms/TextArea.svelte';
	import StatelessModal from '$lib/components/ui/StatelessModal.svelte';
	import { pronounsEnabled } from '$lib/config';
	import { enhance } from '$lib/enchance';
	import { allPronouns, pronounString } from '$lib/players';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: settings = data.player.settings;
	$: pronoun = data.player.pronoun.toString();

	async function close() {
		await goto(themePreviewHref($page.url, '/account'), { noScroll: true });
	}
</script>

<StatelessModal
	title={$_('edit-character', { values: { name: data.player.name } })}
	on:close={close}>
	<form class="flex flex-col gap-4" method="post" use:enhance>
		{#if form?.errors?.global}
			<p class="text-xs text-error-500">{form.errors.global}</p>
		{/if}

		<div class="grid grid-cols-2 gap-2">
			<div class="flex flex-col gap-2 justify-start">
				<Checkbox
					label={$_('character-hidden')}
					name="characterHidden"
					checked={settings.hidden}
					errors={form?.errors?.characterHidden} />

				<Checkbox
					label={$_('character-show-skills')}
					name="showSkills"
					checked={settings.show_skills}
					errors={form?.errors?.showSkills} />
				<Checkbox
					label={$_('character-show-inventory')}
					name="showInventory"
					checked={settings.show_inventory}
					errors={form?.errors?.showInventory} />
			</div>

			<div class="flex flex-col gap-2">
				{#if pronounsEnabled}
					<Select
						name="pronoun"
						value={pronoun}
						label={$_('character-pronoun')}
						errors={form?.errors?.pronoun}>
						{#each allPronouns as pronounValue}
							<option value={pronounValue.toString()}>
								{pronounString(pronounValue)}
							</option>
						{/each}
					</Select>
				{/if}

				<TextArea
					name="comment"
					label={$_('character-comment')}
					value={settings.comment ?? ''}
					errors={form?.errors?.comment} />
			</div>
		</div>

		<div class="flex flex-row justify-end">
			<Button>{$_('save')}</Button>
		</div>
	</form>
</StatelessModal>
