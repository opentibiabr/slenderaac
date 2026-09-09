<script lang="ts">
	import { onDestroy } from 'svelte';
	import { _ } from 'svelte-i18n';

	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';

	import TextField from '$lib/components/ui/forms/TextField.svelte';

	export let label: string;

	let value = $page.url.searchParams.get('search') || '';
	let loadedUrl = $page.url.href;
	let pending: ReturnType<typeof setTimeout> | undefined;

	export const reset = (): void => void (value = '');

	$: if (loadedUrl !== $page.url.href) {
		loadedUrl = $page.url.href;
		value = $page.url.searchParams.get('search') ?? '';
	}

	function cancelPendingSearch() {
		clearTimeout(pending);
		pending = undefined;
	}
	beforeNavigate(cancelPendingSearch);
	onDestroy(cancelPendingSearch);

	function onSearchInput() {
		cancelPendingSearch();
		const url = new URL($page.url);
		pending = setTimeout(() => {
			pending = undefined;
			if (value === '') url.searchParams.delete('search');
			else url.searchParams.set('search', value);
			void goto(`${url.pathname}${url.search}${url.hash}`, {
				replaceState: true,
				keepFocus: true,
				noScroll: true,
			});
		}, 200);
	}
</script>

<TextField
	{label}
	type="search"
	name="search"
	variant="horizontal"
	placeholder={$_('search')}
	on:input={onSearchInput}
	bind:value />
