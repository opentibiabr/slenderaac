<script lang="ts">
	export let title: string;
	export let image: string | null = null;
	export let size = 38;
</script>

<div class="catalog-heading" style={`--catalog-image-size: ${size}px`}>
	<div>
		{#if image}<img src={image} alt="" width={size} height={size} />{/if}
	</div>
	<h2>{title}</h2>
	<div>
		{#if image}<img src={image} alt="" width={size} height={size} />{/if}
	</div>
</div>

<style>
	.catalog-heading {
		display: grid;
		grid-template-columns: minmax(var(--catalog-image-size), 5%) 1fr minmax(
				var(--catalog-image-size),
				5%
			);
		align-items: center;
	}
	h2 {
		text-align: center;
		font-weight: bold;
		margin: 0.83em 0;
	}
	:global(.theme-classic) h2 {
		font:
			bold 20px Verdana,
			Arial,
			sans-serif;
		margin: 0.83em 0;
	}
</style>
