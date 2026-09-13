<script lang="ts">
	import 'svooltip/styles.css';
	import './app.postcss';

	import {
		arrow,
		autoUpdate,
		computePosition,
		flip,
		offset,
		shift,
	} from '@floating-ui/dom';
	import {
		getToastStore,
		initializeStores,
		Toast,
	} from '@skeletonlabs/skeleton';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { onDestroy } from 'svelte';
	import { getFlash } from 'sveltekit-flash-message/client';

	import { browser } from '$app/environment';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';

	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import { boostedStatus } from '$lib/stores/boosted';
	import { loading } from '$lib/stores/loading';
	import { themePreviewHref } from '$lib/themes/preview';
	import { themeRegistry } from '$lib/themes/registry';
	import { normalizeTheme } from '$lib/themes/theme-ids';
	import ThemeSwitcher from '$lib/themes/ThemeSwitcher.svelte';
	import { browserTitle } from '$lib/utils';

	import type { LayoutData } from './$types';

	initializeStores();

	const toastStore = getToastStore();

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	export let data: LayoutData & { selectedTheme?: string };

	$: title = typeof $page.data.title === 'string' ? $page.data.title : '';
	$: selectedTheme = normalizeTheme(data.selectedTheme);
	$: activeTheme = themeRegistry[selectedTheme] ?? themeRegistry.legbone;
	$: liveBoosted = $boostedStatus?.selections;
	$: shellData = {
		...data,
		boostedCreature: liveBoosted
			? liveBoosted.boostedCreature
			: data.boostedCreature,
		boostedBoss: liveBoosted ? liveBoosted.boostedBoss : data.boostedBoss,
		boostedDataStale: $boostedStatus?.stale ?? false,
	};

	const flash = getFlash(page);

	beforeNavigate((nav) => {
		if ($flash && nav.from?.url.toString() !== nav.to?.url.toString()) {
			$flash = undefined;
		}
		if (
			data.themeSwitcherEnabled &&
			nav.type === 'link' &&
			nav.to?.route.id?.startsWith('/(app)') &&
			nav.to.url.origin === $page.url.origin &&
			$page.url.searchParams.has('themePreview') &&
			!nav.to.url.searchParams.has('themePreview')
		) {
			nav.cancel();
			void goto(themePreviewHref($page.url, nav.to.url.href));
		}
	});

	const unsubscribe = flash.subscribe(($flash) => {
		if ($flash) {
			const { message, type: flashType } = $flash;
			toastStore.trigger({
				message: message,
				background: `${
					flashType === 'success' ? 'bg-success-800' : 'bg-error-800'
				} text-white`,
			});
		}
	});
	onDestroy(unsubscribe);
</script>

<svelte:head>
	<title>{browserTitle(title)}</title>
</svelte:head>

<div id="top" aria-hidden="true"></div>

{#if data.themeSwitcherEnabled}
	<ThemeSwitcher {selectedTheme} themeAssets={data.themeAssets} />
{/if}

{#if browser}
	<Toast />
{/if}

<svelte:component this={activeTheme.Shell} data={shellData}>
	<slot />
</svelte:component>

{#if $loading}
	<ProgressBar infinite />
{/if}
