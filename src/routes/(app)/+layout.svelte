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
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';

	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import { loading } from '$lib/stores/loading';
	import { normalizeTheme } from '$lib/themes/theme-ids';
	import { themeRegistry } from '$lib/themes/registry';
	import { browserTitle } from '$lib/utils';

	import type { LayoutData } from './$types';

	initializeStores();

	const toastStore = getToastStore();

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	export let data: LayoutData & { selectedTheme?: string };

	$: title = typeof $page.data.title === 'string' ? $page.data.title : '';
	$: selectedTheme = normalizeTheme(data.selectedTheme);
	$: activeTheme = themeRegistry[selectedTheme] ?? themeRegistry.legbone;

	const flash = getFlash(page);

	beforeNavigate((nav) => {
		if ($flash && nav.from?.url.toString() !== nav.to?.url.toString()) {
			$flash = undefined;
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

{#if browser}
	<Toast />
{/if}

<svelte:component this={activeTheme.Shell} {data}>
	<slot />
</svelte:component>

{#if $loading}
	<ProgressBar infinite />
{/if}
