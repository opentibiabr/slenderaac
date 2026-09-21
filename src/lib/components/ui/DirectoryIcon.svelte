<script lang="ts">
	import { page } from '$app/stores';

	import AssetImage from '$lib/components/ui/AssetImage.svelte';

	export let asset: string;
	export let label: string;
	export let width = 16;
	$: src = $page.data.themeAssets?.[asset];
</script>

<span class="directory-icon" title={label} aria-label={label}
	><AssetImage {src} alt={label} {width} height={16}
		><span class="directory-icon__fallback" aria-hidden="true"
			>{label.slice(0, 2)}</span
		></AssetImage
	></span>

<style>
	.directory-icon {
		display: inline-block;
		vertical-align: middle;
		margin-right: 3px;
	}
	.directory-icon__fallback {
		display: inline-block;
		width: 16px;
		height: 16px;
		font:
			bold 10px/16px Arial,
			sans-serif;
		text-align: center;
	}
</style>
