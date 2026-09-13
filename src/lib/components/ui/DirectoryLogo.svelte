<script lang="ts">
	import AssetImage from '$lib/components/ui/AssetImage.svelte';

	export let src: string | null | undefined = null;
	export let name: string;
</script>

<span class="directory-logo">
	<AssetImage {src} alt={name} width={150} height={100}
		><span>{name}</span></AssetImage>
</span>

<style>
	.directory-logo {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 150px;
		height: 100px;
		max-width: 100%;
		vertical-align: top;
	}
	.directory-logo > span {
		padding: 8px;
		overflow-wrap: anywhere;
		text-align: center;
		font:
			bold 18px Georgia,
			serif;
	}
	:global(.theme-classic) .directory-logo > span {
		color: #5a2800;
		text-shadow: none;
	}
</style>
