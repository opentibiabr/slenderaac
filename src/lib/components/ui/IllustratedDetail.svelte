<script lang="ts">
	export let picture: string | undefined = undefined;
	export let name: string;
	let failedPicture: string | undefined;
</script>

<div class="illustrated-detail">
	<div class="illustrated-detail__artwork">
		{#if picture && failedPicture !== picture}
			<img
				src={picture}
				alt={name}
				width="150"
				height="150"
				on:error={() => (failedPicture = picture)} />
		{:else}
			<div
				class="illustrated-detail__missing"
				role="img"
				aria-label={`${name}: image unavailable`}>
				Image unavailable
			</div>
		{/if}
	</div>
	<div class="illustrated-detail__description"><slot /></div>
</div>

<style>
	.illustrated-detail {
		display: grid;
		grid-template-columns: 158px minmax(0, 1fr);
		gap: 1px;
		padding: 1px;
	}
	.illustrated-detail__artwork,
	.illustrated-detail__description {
		padding: 4px;
		min-height: 161px;
	}
	.illustrated-detail__artwork img {
		display: block;
		width: 150px;
		height: 150px;
		object-fit: contain;
	}
	.illustrated-detail__missing {
		display: grid;
		place-items: center;
		width: 150px;
		height: 150px;
		text-align: center;
		font-size: 12px;
	}
	.illustrated-detail__description :global(p) {
		margin: 16px 0 0;
	}
	@media (max-width: 599px) {
		.illustrated-detail {
			grid-template-columns: minmax(0, 1fr);
		}
		.illustrated-detail__artwork {
			justify-self: center;
		}
		.illustrated-detail__description {
			min-height: 0;
		}
	}
</style>
