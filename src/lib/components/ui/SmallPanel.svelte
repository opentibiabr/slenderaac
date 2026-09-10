<script lang="ts">
	import { page } from '$app/stores';

	import SmallBox from '$lib/themes/classic/SmallBox.svelte';

	export let dense = false;
</script>

{#if $page.data.selectedTheme === 'classic'}<SmallBox
		assets={$page.data.themeAssets}
		{dense}><slot /></SmallBox
	>{:else}<div class="card p-3"><slot /></div>{/if}
