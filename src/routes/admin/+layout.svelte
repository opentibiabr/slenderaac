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
		faBookBookmark,
		faCalendar,
		faGlobe,
		faHome,
		faNewspaper,
	} from '@fortawesome/free-solid-svg-icons';
	import {
		AppShell,
		initializeStores,
		Modal,
		Toast,
	} from '@skeletonlabs/skeleton';
	import { storePopup } from '@skeletonlabs/skeleton';
	import Fa from 'svelte-fa';
	import { portal } from 'svelte-portal';

	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import { browserTitle } from '$lib/utils';

	initializeStores();

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	$: title = typeof $page.data.title === 'string' ? $page.data.title : '';
</script>

<svelte:head>
	<title>{browserTitle(title, { admin: true })}</title>
</svelte:head>

{#if browser}
	<Modal />
	<Toast
		position="br"
		rounded="rounded-full"
		buttonDismiss="hidden"
		spacing="gap-0" />
{/if}

<div
	class="hidden md:flex flex-row justify-center items-start fixed top-0 left-0 right-0"
	use:portal>
	<a
		class="flex gap-2 items-center justify-center rounded-b-lg px-4 py-1 bg-primary-800/75 text-white text-sm"
		href="/"
		data-sveltekit-reload
		data-sveltekit-preload-data="off"
		data-sveltekit-preload-code="off">
		Back to the site
		<Fa icon={faGlobe} />
	</a>
</div>

<AppShell
	slotSidebarLeft="bg-surface-500/5 w-56 p-4"
	regionPage="gap-2 max-w-5xl">
	<svelte:fragment slot="sidebarLeft">
		<nav class="list-nav">
			<ul class="[&_a]:flex [&_a]:flex-row [&_a]:gap-2 [&_a]:items-center">
				<li><a href="/admin"><Fa icon={faHome} />Home</a></li>
				<li><a href="/admin/news"><Fa icon={faNewspaper} />News</a></li>
				<li>
					<a href="/admin/events"><Fa icon={faCalendar} />Event Schedule</a>
				</li>
				<li>
					<a href="/admin/world-quests"><Fa icon={faGlobe} />World Quests</a>
				</li>
				<li>
					<a href="/admin/static-pages"
						><Fa icon={faBookBookmark} />Static Pages</a>
				</li>
			</ul>
		</nav>
	</svelte:fragment>

	<div class="container mx-auto p-8 space-y-8">
		<slot />
	</div>
</AppShell>
