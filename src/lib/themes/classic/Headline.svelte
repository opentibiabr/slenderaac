<script lang="ts">
	export let title: string;
	export let image: string | null = null;
	export let width = 250;
	export let height = 28;
	export let offsetX = 0;
</script>

<h1 class:classic-headline--image={!!image} class="classic-headline">
	{#if image}
		<img
			src={image}
			alt={title}
			style={`width:${width}px;height:${height}px;transform:translateX(${offsetX}px)`} />
	{:else}{title}{/if}
</h1>

<style>
	.classic-headline {
		margin: 0;
		min-width: 0;
		font-family: ClassicHeadline, Georgia, serif;
		font-size: 20px;
		font-weight: 400;
		line-height: 28px;
		color: rgb(240 209 151);
		text-shadow: 1px 1px 0 #000;
		white-space: nowrap;
	}
	.classic-headline:not(.classic-headline--image) {
		padding-left: 3px;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.classic-headline--image {
		flex: 0 0 auto;
		line-height: 0;
	}
	.classic-headline img {
		display: block;
		max-width: none;
		object-fit: none;
		object-position: left top;
		image-rendering: pixelated;
	}
</style>
