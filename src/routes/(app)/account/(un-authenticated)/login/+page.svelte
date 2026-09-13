<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/forms/TextField.svelte';
	import { enhance } from '$lib/enchance';
	import ClassicLogin from '$lib/themes/classic/Login.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

{#if $page.data.selectedTheme === 'classic'}<ClassicLogin {form} />{:else}
	<form class="flex flex-col gap-4" method="post" use:enhance>
		{#if form?.errors?.global}
			<p class="text-error-500">{form.errors.global}</p>
		{/if}

		{#if form?.tokenRequired}
			<input type="hidden" name="email" value={form.email} />
			<input type="hidden" name="password" value={form.password} />
			<TextField
				required
				label={$_('token')}
				name="token"
				type="number"
				autocomplete="one-time-code"
				errors={form?.errors?.token} />
		{:else}
			<label class="label">
				<span>{$_('email')}</span>
				<input
					required
					name="email"
					class="input"
					type="email"
					autocomplete="email" />
			</label>

			<label class="label flex-grow">
				<span>{$_('password')}</span>
				<input
					required
					name="password"
					class="input"
					type="password"
					autocomplete="new-password" />
			</label>
		{/if}

		<div class="flex flex-row justify-end items-center gap-2">
			<a href={themePreviewHref($page.url, `/account/lost`)}
				>{$_('lost-account')}</a>
			<Button>{$_('login')}</Button>
		</div>

		<hr class="divider" />

		<div class="flex flex-row justify-center items-center gap-2 mb-4">
			<h3 class="h3">{$_('dont-have-an-account')}</h3>
			<Button
				href={themePreviewHref($page.url, `/account/signup`)}
				color="secondary">{$_('create-account')}</Button>
		</div>
	</form>
{/if}
