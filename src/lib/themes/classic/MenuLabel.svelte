<script lang="ts">
	import { page } from '$app/stores';

	import { headlineFontStyle } from './headline';

	export let text: string;
	export let image: string | null = null;
	let renderedImage: string | null = null;
	let imageFailed = false;
	$: if (image !== renderedImage) {
		renderedImage = image;
		imageFailed = false;
	}
	$: useImage = !!image && !imageFailed;
	let hasMenuFont = false;
	$: menuFontStyle = headlineFontStyle(
		$page.data.themeAssets?.menuFont,
		'ClassicMenu',
	);

	function checkImage(node: HTMLImageElement) {
		if (node.complete && node.naturalWidth === 0) imageFailed = true;
	}

	function loadMenuFont(_node: HTMLElement, style: string) {
		let revision = 0;
		function update(value: string) {
			const current = ++revision;
			hasMenuFont = false;
			if (!value || !document.fonts) return;
			void document.fonts.load('20px ClassicMenu').then(
				(fonts) => {
					if (current === revision) hasMenuFont = fonts.length > 0;
				},
				() => {},
			);
		}
		update(style);
		return { update, destroy: () => revision++ };
	}
</script>

<span
	use:loadMenuFont={useImage ? '' : menuFontStyle}
	class="classic-menu-label"
	class:classic-menu-label--text={!useImage}
	class:classic-menu-label--font={hasMenuFont}
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
	.classic-menu-label--text.classic-menu-label--font {
		font-family: ClassicMenu, ClassicHeadline, Georgia, serif;
		font-size: 20px;
		letter-spacing: -0.5px;
	}
</style>
