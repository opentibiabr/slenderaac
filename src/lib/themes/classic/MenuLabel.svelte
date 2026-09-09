<script lang="ts">
	export let text: string;
	export let image: string | null = null;
	let renderedImage: string | null = null;
	let imageFailed = false;
	$: if (image !== renderedImage) {
		renderedImage = image;
		imageFailed = false;
	}
	$: useImage = !!image && !imageFailed;

	function checkImage(node: HTMLImageElement) {
		if (node.complete && node.naturalWidth === 0) imageFailed = true;
	}
</script>

<span
	class="classic-menu-label"
	class:classic-menu-label--text={!useImage}
	title={text}>
	{#if useImage}
		<img
			use:checkImage
			src={image ?? undefined}
			alt={text}
			on:error={() => (imageFailed = true)} />
	{:else}{text}{/if}
</span>

<style>
	/* All category titles share this slot; keep icons and toggle hitboxes in Menu. */
	.classic-menu-label {
		display: block;
		flex: 0 0 116px;
		width: 116px;
		height: 22px;
		transform: translateY(1px);
	}
	.classic-menu-label img {
		display: block;
		width: 116px;
		height: 22px;
		object-fit: contain;
	}
	.classic-menu-label--text {
		overflow: hidden;
		color: rgb(217 180 152);
		font-family: ClassicHeadline, Georgia, serif;
		font-size: 16px;
		font-weight: 400;
		letter-spacing: -1px;
		line-height: 22px;
		text-align: center;
		text-overflow: ellipsis;
		text-shadow: 1px 1px 0 #000;
		white-space: nowrap;
	}
</style>
