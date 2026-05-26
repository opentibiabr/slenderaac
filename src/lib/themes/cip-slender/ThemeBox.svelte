<script lang="ts">
	export let title: string;
	export let ornament: string | null = null;
</script>

<section class="theme-cip-slender-box">
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
		border: 1px solid rgb(85 63 42);
		background: rgb(31 25 20 / 0.92);
		box-shadow:
			inset 0 0 0 1px rgb(255 232 185 / 0.08),
			0 10px 24px rgb(0 0 0 / 0.24);
		color: rgb(242 226 195);
	}

	:global(.theme-cip-slender) .theme-cip-slender-box header {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 32px;
		padding: 6px 10px;
		border-bottom: 1px solid rgb(85 63 42);
		background: linear-gradient(180deg, rgb(94 36 22), rgb(53 28 20));
	}

	:global(.theme-cip-slender) .theme-cip-slender-box h2 {
		margin: 0;
		font-size: 13px;
		font-weight: 700;
		line-height: 1.2;
	}

	:global(.theme-cip-slender) .theme-cip-slender-box img,
	:global(.theme-cip-slender) .theme-cip-slender-box__mark {
		width: 18px;
		height: 18px;
		flex: 0 0 18px;
	}

	:global(.theme-cip-slender) .theme-cip-slender-box__mark {
		display: inline-block;
		border: 1px solid rgb(211 162 73);
		background: rgb(127 84 34);
	}

	:global(.theme-cip-slender) .theme-cip-slender-box__body {
		padding: 10px;
	}
</style>
