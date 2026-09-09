<script lang="ts">
	export let assets: Record<string, string | undefined> | null | undefined;
	$: frame = [
		['horizontal', 'contentFrameHorizontal'],
		['vertical', 'contentFrameVertical'],
		['edge', 'contentFrameEdge'],
	]
		.map(
			([side, key]) =>
				`--small-box-${side}: ${assets?.[key] ? `url("${assets[key]}")` : 'none'}`,
		)
		.join(';');
</script>

<div class="small-box" style={frame}>
	<span class="small-box__edge small-box__edge--tl" aria-hidden="true"></span>
	<span class="small-box__edge small-box__edge--tr" aria-hidden="true"></span>
	<div class="small-box__body"><slot /></div>
	<span class="small-box__edge small-box__edge--bl" aria-hidden="true"></span>
	<span class="small-box__edge small-box__edge--br" aria-hidden="true"></span>
</div>

<style>
	.small-box {
		position: relative;
		padding: 4px 0;
		background:
			var(--small-box-horizontal) top / auto 4px repeat-x,
			var(--small-box-horizontal) bottom / auto 4px repeat-x;
	}
	.small-box__body {
		padding: 10px;
		background:
			var(--small-box-vertical) left / 3px auto repeat-y,
			var(--small-box-vertical) right / 3px auto repeat-y,
			#d4c0a1;
	}
	.small-box__edge {
		position: absolute;
		z-index: 1;
		width: 5px;
		height: 5px;
		background: var(--small-box-edge);
		pointer-events: none;
	}
	.small-box__edge--tl {
		top: -1px;
		left: -1px;
	}
	.small-box__edge--tr {
		top: -1px;
		right: -1px;
	}
	.small-box__edge--bl {
		bottom: -1px;
		left: -1px;
	}
	.small-box__edge--br {
		bottom: -1px;
		right: -1px;
	}
</style>
