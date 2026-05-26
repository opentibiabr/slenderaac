<script lang="ts">
	export let title = '';
	export let ornament: string | null = null;
</script>

<main class="theme-cip-slender-content-frame">
	{#if title.length > 0}
		<header>
			{#if ornament}
				<img src={ornament} alt="" aria-hidden="true" />
			{/if}
			<h1>{title}</h1>
		</header>
	{/if}

	<div class="theme-cip-slender-content-frame__body">
		<slot />
	</div>
</main>

<style>
	:global(.theme-cip-slender) .theme-cip-slender-content-frame {
		border: 1px solid rgb(74 51 33);
		background:
			linear-gradient(rgb(247 229 190 / 0.92), rgb(227 200 153 / 0.94)),
			rgb(233 207 163);
		box-shadow:
			inset 0 0 0 2px rgb(105 74 44 / 0.45),
			0 18px 40px rgb(0 0 0 / 0.35);
		color: rgb(42 27 17);
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame header {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 42px;
		padding: 8px 14px;
		border-bottom: 1px solid rgb(112 78 47);
		background: linear-gradient(180deg, rgb(79 39 24), rgb(42 26 19));
		color: rgb(252 231 177);
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame h1 {
		margin: 0;
		font-size: 18px;
		font-weight: 800;
		line-height: 1.2;
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame img {
		width: 22px;
		height: 22px;
		flex: 0 0 22px;
	}

	:global(.theme-cip-slender) .theme-cip-slender-content-frame__body {
		min-height: 360px;
		padding: 14px;
		overflow-x: auto;
	}
</style>
