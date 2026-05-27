<script lang="ts">
	export let title: string;
	export let ornament: string | null = null;
	export let headerBackground: string | null = null;
	export let top: string | null = null;
	export let bottom: string | null = null;

	$: boxStyle = [
		headerBackground ? `--cip-box-header: url("${headerBackground}")` : '',
		top ? `--cip-box-top: url("${top}")` : '',
		bottom ? `--cip-box-bottom: url("${bottom}")` : '',
	]
		.filter(Boolean)
		.join('; ');
</script>

<section class="theme-cip-slender-box" style={boxStyle}>
	<header>
		{#if ornament}
			<img src={ornament} alt="" aria-hidden="true" />
		{:else}
			<span class="theme-cip-slender-box__mark" aria-hidden="true"></span>
		{/if}
		<h2>{title}</h2>
	</header>
	<div class="theme-cip-slender-box__body">
		<slot />
	</div>
</section>

<style>
	:global(.theme-cip-slender) .theme-cip-slender-box {
		position: relative;
		border: 1px solid rgb(85 63 42);
		background:
			linear-gradient(rgb(16 18 16 / 0.82), rgb(10 11 10 / 0.9)), rgb(16 18 16);
		box-shadow:
			inset 0 0 0 1px rgb(255 232 185 / 0.12),
			0 8px 18px rgb(0 0 0 / 0.35);
		color: rgb(242 226 195);
	}

	:global(.theme-cip-slender) .theme-cip-slender-box::before,
	:global(.theme-cip-slender) .theme-cip-slender-box::after {
		position: absolute;
		right: -1px;
		left: -1px;
		height: 10px;
		background-repeat: repeat-x;
		background-size: auto 100%;
		content: '';
		pointer-events: none;
	}

	:global(.theme-cip-slender) .theme-cip-slender-box::before {
		top: -8px;
		background-image: var(--cip-box-top, none);
	}

	:global(.theme-cip-slender) .theme-cip-slender-box::after {
		bottom: -8px;
		background-image: var(--cip-box-bottom, none);
	}

	:global(.theme-cip-slender) .theme-cip-slender-box header {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 32px;
		padding: 4px 8px;
		border-bottom: 1px solid rgb(85 63 42);
		background:
			var(--cip-box-header, none) repeat-x,
			linear-gradient(180deg, rgb(111 24 17), rgb(52 17 13));
	}

	:global(.theme-cip-slender) .theme-cip-slender-box h2 {
		margin: 0;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 15px;
		font-weight: 700;
		line-height: 1.2;
		text-shadow: 1px 1px 0 rgb(0 0 0);
	}

	:global(.theme-cip-slender) .theme-cip-slender-box img,
	:global(.theme-cip-slender) .theme-cip-slender-box__mark {
		width: 16px;
		height: 16px;
		flex: 0 0 16px;
	}

	:global(.theme-cip-slender) .theme-cip-slender-box__mark {
		display: inline-block;
		border: 1px solid rgb(211 162 73);
		background: rgb(127 84 34);
	}

	:global(.theme-cip-slender) .theme-cip-slender-box__body {
		padding: 10px;
		background:
			linear-gradient(90deg, rgb(255 255 255 / 0.04), transparent 44%),
			rgb(15 17 15 / 0.58);
	}
</style>
