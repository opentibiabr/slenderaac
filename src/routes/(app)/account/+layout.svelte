<script lang="ts">
	import { page } from '$app/stores';

	import PagePanel from '$lib/components/ui/PagePanel.svelte';
</script>

{#if !$page.data.isLoggedIn && !($page.data.selectedTheme === 'cip-slender' && $page.url.pathname === '/account/login')}
	<PagePanel
		title={$page.url.pathname === '/account/signup'
			? 'Create New Account'
			: $page.url.pathname === '/account/lost'
				? 'Recover by Email'
				: ($page.data.title ?? 'Account Management')}
		surface><slot /></PagePanel>
{:else}<slot />{/if}
