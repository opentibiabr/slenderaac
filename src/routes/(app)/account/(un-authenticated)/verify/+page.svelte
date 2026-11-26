<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { enhance } from '$lib/enchance';

	import Button from '$lib/components/ui/Button.svelte';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<form class="flex flex-col gap-4 items-center" method="post" use:enhance>
	{#if form?.errors?.global}
		<p class="text-error-500">{form.errors.global}</p>
	{/if}

	<input type="hidden" name="token" value={data.token} />
	<span class="h4">
		{$_('verify.welcome')}
	</span>

	<Button>{$_('verify.confirm')}</Button>
</form>
