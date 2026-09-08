<script lang="ts">
	export let attrs: Record<string, string>;
</script>

<a
	class="information-action"
	href={attrs.href}
	style={`--action-background: url("${attrs.src}"); --action-hover: url("${attrs['hover-src'] ?? attrs.src}")`}
	><slot /></a>

<style>
	:global(.theme-cip-slender) a.information-action {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 135px;
		height: 25px;
		margin: 0 auto;
		padding: 0;
		background-image: var(--action-background);
		color: rgb(255 209 140);
		font:
			12px Verdana,
			Arial,
			'Times New Roman',
			sans-serif;
		text-align: center;
		text-decoration: none;
		text-shadow:
			-1px -1px 0 black,
			0 -1px 0 black,
			1px -1px 0 black,
			1px 0 0 black,
			1px 1px 0 black,
			0 1px 0 black,
			-1px 1px 0 black,
			-1px 0 0 black;
	}
	:global(.theme-cip-slender) a.information-action:hover {
		background-image: var(--action-hover);
	}
</style>
