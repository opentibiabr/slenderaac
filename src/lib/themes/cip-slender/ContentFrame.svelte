<script lang="ts">
	export let title = '';
	export let ornament: string | null = null;
	export let titleBackground: string | null = null;
	export let frameHorizontal: string | null = null;
	export let frameVertical: string | null = null;
	export let frameEdge: string | null = null;
	export let border: string | null = null;
	export let headlineImage: string | null = null;
	export let paperTexture: string | null = null;

	$: frameStyle = [
		titleBackground ? `--cip-content-title: url("${titleBackground}")` : '',
		frameHorizontal
			? `--cip-content-frame-horizontal: url("${frameHorizontal}")`
			: '',
		frameVertical
			? `--cip-content-frame-vertical: url("${frameVertical}")`
			: '',
		frameEdge ? `--cip-content-frame-edge: url("${frameEdge}")` : '',
		border ? `--cip-content-border: url("${border}")` : '',
		paperTexture ? `--cip-paper-texture: url("${paperTexture}")` : '',
		'--cip-center-chrome-fill: rgb(35 35 34)',
	]
		.filter(Boolean)
		.join('; ');
</script>

<main
	class="theme-cip-slender-content-frame theme-cip-slender__center-chrome"
	style={frameStyle}>
	<div
		class="theme-cip-slender-content-frame__border theme-cip-slender-content-frame__border--top"
		aria-hidden="true"></div>
	{#if title.length > 0}
		<header>
			{#if headlineImage}
				<img
					class="theme-cip-slender-content-frame__headline"
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

	<div class="theme-cip-slender-content-frame__border" aria-hidden="true"></div>
	<div class="theme-cip-slender-content-frame__body">
		<span
			class="theme-cip-slender-content-frame__side theme-cip-slender-content-frame__side--left"
			aria-hidden="true"></span>
		<span
			class="theme-cip-slender-content-frame__side theme-cip-slender-content-frame__side--right"
			aria-hidden="true"></span>
		<div class="theme-cip-slender-content-frame__paper">
			<slot />
		</div>
	</div>
	<div class="theme-cip-slender-content-frame__border" aria-hidden="true"></div>
</main>

<style>
	:global(.theme-cip-slender) .theme-cip-slender-content-frame {
		position: relative;
		padding: 4px 3px 5px;
		box-shadow: 0 12px 30px rgb(0 0 0 / 0.42);
		color: rgb(42 27 17);
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame header {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0;
		min-height: 28px;
		padding: 0 8px;
		border: 0;
		background:
			var(--cip-content-title, none) repeat-x,
			linear-gradient(180deg, rgb(28 71 22), rgb(15 44 14));
		color: rgb(252 231 177);
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame h1 {
		margin: 0;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 22px;
		font-weight: 800;
		line-height: 1.2;
		text-shadow:
			1px 1px 0 rgb(0 0 0),
			0 0 8px rgb(0 0 0 / 0.7);
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame header > img {
		width: 16px;
		height: 16px;
		flex: 0 0 16px;
	}

	:global(.theme-cip-slender)
		.theme-cip-slender-content-frame
		header
		.theme-cip-slender-content-frame__headline {
		width: 250px;
		height: 28px;
		flex: 0 0 250px;
		object-fit: contain;
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame__border {
		height: 6px;
		background:
			var(--cip-content-border, none) repeat-x,
			rgb(70 62 46);
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame__body {
		position: relative;
		min-height: 620px;
		padding: 0;
		background: rgb(47 47 47);
		overflow-x: auto;
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame__side {
		position: absolute;
		top: 0;
		bottom: 0;
		z-index: 1;
		width: 3px;
		background: var(--cip-content-frame-vertical, none) repeat-y;
		pointer-events: none;
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame__side--left {
		left: 0;
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame__side--right {
		right: 0;
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame__paper {
		position: relative;
		z-index: 2;
		min-height: 620px;
		padding: 16px 18px;
		border: 0;
		background:
			var(--cip-paper-texture, none) repeat,
			rgb(242 222 181);
		box-shadow: inset 0 0 16px rgb(132 87 43 / 0.16);
	}
</style>
