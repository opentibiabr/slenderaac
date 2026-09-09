<script lang="ts">
	export let title = '';
	export let ornament: string | null = null;
	export let titleBackground: string | null = null;
	export let frameHorizontal: string | null = null;
	export let frameVertical: string | null = null;
	export let frameEdge: string | null = null;
	export let cornerTopLeft: string | null = null;
	export let cornerTopRight: string | null = null;
	export let cornerBottomLeft: string | null = null;
	export let cornerBottomRight: string | null = null;
	export let border: string | null = null;
	export let headlineImage: string | null = null;
	export let headlineWidth = 250;
	export let headlineHeight = 28;
	export let headlineOffsetX = 0;
	export let paperTexture: string | null = null;
	export let compact = false;
	export let paperMinHeight = 620;

	$: frameStyle = [
		titleBackground ? `--classic-content-title: url("${titleBackground}")` : '',
		frameHorizontal
			? `--classic-content-frame-horizontal: url("${frameHorizontal}")`
			: '',
		frameVertical
			? `--classic-content-frame-vertical: url("${frameVertical}")`
			: '',
		frameEdge ? `--classic-content-frame-edge: url("${frameEdge}")` : '',
		cornerTopLeft ? `--classic-info-corner-tl: url("${cornerTopLeft}")` : '',
		cornerTopRight ? `--classic-info-corner-tr: url("${cornerTopRight}")` : '',
		cornerBottomLeft
			? `--classic-info-corner-bl: url("${cornerBottomLeft}")`
			: '',
		cornerBottomRight
			? `--classic-info-corner-br: url("${cornerBottomRight}")`
			: '',
		border ? `--classic-content-border: url("${border}")` : '',
		paperTexture ? `--classic-paper-texture: url("${paperTexture}")` : '',
		`--classic-content-headline-width: ${headlineWidth}px`,
		`--classic-content-headline-height: ${headlineHeight}px`,
		`--classic-content-headline-offset-x: ${headlineOffsetX}px`,
		`--classic-content-paper-min-height: ${paperMinHeight}px`,
		'--classic-center-chrome-fill: rgb(222 187 157)',
	]
		.filter(Boolean)
		.join('; ');
</script>

<main
	class={`theme-classic-content-frame theme-classic__center-chrome${
		compact ? ' theme-classic-content-frame--compact' : ''
	}`}
	style={frameStyle}>
	<div
		class="theme-classic-content-frame__border theme-classic-content-frame__border--top"
		aria-hidden="true">
	</div>
	{#if title.length > 0}
		<header>
			{#if headlineImage}
				<img
					class="theme-classic-content-frame__headline"
					src={headlineImage}
					alt={title} />
			{:else if ornament}
				<img src={ornament} alt="" aria-hidden="true" />
				<h1>{title}</h1>
			{:else}
				<h1>{title}</h1>
			{/if}
		</header>
	{/if}

	<div
		class="theme-classic-content-frame__border theme-classic-content-frame__border--gap"
		aria-hidden="true">
	</div>
	<div class="theme-classic-content-frame__body">
		<span
			class="theme-classic-content-frame__side theme-classic-content-frame__side--left"
			aria-hidden="true"></span>
		<span
			class="theme-classic-content-frame__side theme-classic-content-frame__side--right"
			aria-hidden="true"></span>
		<div class="theme-classic-content-frame__paper">
			<slot />
		</div>
	</div>
	<div
		class="theme-classic-content-frame__border theme-classic-content-frame__border--bottom"
		aria-hidden="true">
	</div>
</main>

<style>
	:global(.theme-classic) .theme-classic-content-frame {
		position: relative;
		padding: 0 2px;
		background:
			var(--classic-content-frame-edge, none) left top 4px / 5px 5px no-repeat,
			var(--classic-content-frame-edge, none) right top 4px / 5px 5px no-repeat,
			var(--classic-content-frame-edge, none) left bottom 4px / 5px 5px
				no-repeat,
			var(--classic-content-frame-edge, none) right bottom 4px / 5px 5px
				no-repeat,
			var(--classic-content-frame-vertical, none) left top 5px / 3px 13px
				repeat-y,
			var(--classic-content-frame-vertical, none) right top 5px / 3px 13px
				repeat-y,
			var(--classic-center-chrome-fill, rgb(222 187 157));
		box-shadow: none;
		color: rgb(42 27 17);
		image-rendering: pixelated;
	}

	:global(.theme-classic) .theme-classic-content-frame--compact {
		margin-top: 10px;
	}

	:global(.theme-classic) .theme-classic-content-frame::before,
	:global(.theme-classic) .theme-classic-content-frame::after {
		position: absolute;
		left: -4px;
		width: calc(100% + 8px);
		height: 17px;
		background-repeat: no-repeat;
		background-size:
			17px 17px,
			17px 17px;
		content: '';
		image-rendering: pixelated;
		pointer-events: none;
		z-index: 4;
	}

	:global(.theme-classic) .theme-classic-content-frame::before {
		top: -4px;
		background-image:
			var(--classic-info-corner-tl, none), var(--classic-info-corner-tr, none);
		background-position:
			left top,
			right top;
	}

	:global(.theme-classic) .theme-classic-content-frame::after {
		bottom: -4px;
		background-image:
			var(--classic-info-corner-bl, none), var(--classic-info-corner-br, none);
		background-position:
			left top,
			right top;
	}

	:global(.theme-classic) .theme-classic-content-frame header {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 0;
		height: 24px;
		min-height: 24px;
		padding: 0 14px 0 5px;
		border: 0;
		background:
			var(--classic-content-title, none) repeat-x,
			linear-gradient(180deg, rgb(28 71 22), rgb(15 44 14));
		color: rgb(252 231 177);
	}

	:global(.theme-classic) .theme-classic-content-frame h1 {
		margin: 0;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 22px;
		font-weight: 800;
		line-height: 1.2;
		text-shadow:
			1px 1px 0 rgb(0 0 0),
			0 0 8px rgb(0 0 0 / 0.7);
	}

	:global(.theme-classic) .theme-classic-content-frame header > img {
		width: 16px;
		height: 16px;
		flex: 0 0 16px;
		image-rendering: pixelated;
	}

	:global(.theme-classic)
		.theme-classic-content-frame
		header
		.theme-classic-content-frame__headline {
		width: var(--classic-content-headline-width, 250px);
		height: var(--classic-content-headline-height, 28px);
		flex: 0 0 var(--classic-content-headline-width, 250px);
		image-rendering: pixelated;
		object-fit: none;
		object-position: left top;
		transform: translateX(var(--classic-content-headline-offset-x, 0));
	}

	:global(.theme-classic) .theme-classic-content-frame__border {
		height: 6px;
		background:
			var(--classic-content-border, none) repeat-x,
			rgb(70 62 46);
		image-rendering: pixelated;
	}

	:global(.theme-classic) .theme-classic-content-frame__border--gap {
		display: none;
	}

	:global(.theme-classic) .theme-classic-content-frame__body {
		position: relative;
		margin: 4px;
		padding: 1px;
		background: rgb(121 61 3);
		overflow: visible;
	}

	:global(.theme-classic) .theme-classic-content-frame__side {
		display: none;
	}

	:global(.theme-classic) .theme-classic-content-frame__side--left {
		left: 0;
	}

	:global(.theme-classic) .theme-classic-content-frame__side--right {
		right: 0;
	}

	:global(.theme-classic) .theme-classic-content-frame__paper {
		position: relative;
		z-index: 2;
		min-height: var(--classic-content-paper-min-height, 620px);
		padding: 10px;
		border: 0;
		background:
			var(--classic-paper-texture, none) repeat,
			rgb(255 242 219);
		box-shadow: none;
	}
</style>
