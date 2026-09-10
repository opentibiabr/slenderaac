<script lang="ts">
	import { page } from '$app/stores';

	import AssetImage from '$lib/components/ui/AssetImage.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	export let className = '';
</script>

<a
	class={className}
	href={themePreviewHref($page.url, '/')}
	aria-label={$page.data.serverName}>
	<AssetImage src={$page.data.serverLogo} alt={$page.data.serverName}>
		<span>{$page.data.serverName}</span>
	</AssetImage>
</a>
