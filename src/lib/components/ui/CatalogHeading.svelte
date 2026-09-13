<script lang="ts">
	export let title: string;
	export let image: string | null = null;
	export let size = 38;
	export let variant: 'mirrored' | 'portrait' = 'mirrored';
</script>

<div
	class="catalog-heading"
	class:catalog-heading--portrait={variant === 'portrait'}
	style={`--catalog-image-size: ${size}px`}>
	{#if variant === 'mirrored'}<div>
			{#if image}<img src={image} alt="" width={size} height={size} />{/if}
		</div>{/if}
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
	.catalog-heading--portrait {
		display: block;
		height: var(--catalog-image-size);
		margin-bottom: 5px;
	}
	.catalog-heading--portrait > div {
		float: left;
	}
	.catalog-heading--portrait h2 {
		float: right;
		max-width: calc(100% - var(--catalog-image-size) - 10px);
		overflow-wrap: anywhere;
		text-align: right;
		font-size: 1.5em;
	}
</style>
