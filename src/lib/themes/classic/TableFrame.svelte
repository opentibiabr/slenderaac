<script lang="ts">
	import { classicAsset } from './theme';

	export let assets: Record<string, string | undefined> | null | undefined;
	export let minWidth = 0;
	export let minHeight = 0;
	function image(value: string | null) {
		return value ? `url("${value}")` : 'none';
	}

	$: frameStyle = [
		`--classic-table-min-width: ${minWidth}px`,
		`--classic-table-rail-min-height: ${Math.max(0, minHeight - 30)}px`,
		`--classic-table-edge: ${image(classicAsset(assets, 'contentFrameEdge'))}`,
		`--classic-table-vertical: ${image(classicAsset(assets, 'contentFrameVertical'))}`,
		`--classic-table-border: ${image(classicAsset(assets, 'newsArchiveTableHeadlineBorder'))}`,
	].join('; ');
</script>

<div class="classic-table-scroll" style={frameStyle}>
	<div class="classic-table-frame">
		<div class="classic-table-caption">
			<span
				class="classic-table-caption__edge classic-table-caption__edge--left-top"
				aria-hidden="true"></span>
			<span
				class="classic-table-caption__edge classic-table-caption__edge--right-top"
				aria-hidden="true"></span>
			<span
				class="classic-table-caption__border classic-table-caption__border--top"
				aria-hidden="true"></span>
			<span
				class="classic-table-caption__vertical classic-table-caption__vertical--left"
				aria-hidden="true"></span>
			<div class="classic-table-caption__text"><slot name="caption" /></div>
			<span
				class="classic-table-caption__vertical classic-table-caption__vertical--right"
				aria-hidden="true"></span>
			<span
				class="classic-table-caption__border classic-table-caption__border--bottom"
				aria-hidden="true"></span>
			<span
				class="classic-table-caption__edge classic-table-caption__edge--left-bottom"
				aria-hidden="true"></span>
			<span
				class="classic-table-caption__edge classic-table-caption__edge--right-bottom"
				aria-hidden="true"></span>
		</div>
		<div class="classic-table-frame__rail"><slot /></div>
	</div>
</div>

<style>
	:global(.theme-classic) .classic-table-scroll {
		margin: -3px;
		padding: 3px;
		overflow-x: auto;
	}

	:global(.theme-classic) .classic-table-frame {
		position: relative;
		box-sizing: border-box;
		width: 100%;
		min-width: var(--classic-table-min-width);
		border: 1px solid black;
		color: rgb(90 40 0);
		font-size: 1px;
	}

	:global(.theme-classic) .classic-table-caption {
		position: relative;
		z-index: 2;
		height: 28px;
		background: rgb(95 77 65);
	}

	:global(.theme-classic) .classic-table-caption > span {
		position: absolute;
		z-index: 2;
		display: block;
		pointer-events: none;
		image-rendering: pixelated;
	}

	:global(.theme-classic) .classic-table-caption__edge {
		width: 5px;
		height: 5px;
		background-image: var(--classic-table-edge);
	}

	:global(.theme-classic) .classic-table-caption__edge--left-top {
		top: -2px;
		left: -2px;
	}

	:global(.theme-classic) .classic-table-caption__edge--right-top {
		top: -2px;
		right: -2px;
	}

	:global(.theme-classic) .classic-table-caption__edge--left-bottom {
		bottom: -3px;
		left: -2px;
	}

	:global(.theme-classic) .classic-table-caption__edge--right-bottom {
		right: -2px;
		bottom: -3px;
	}

	:global(.theme-classic) .classic-table-caption__border {
		left: 0;
		width: 100%;
		height: 4px;
		background-image: var(--classic-table-border);
		background-repeat: repeat-x;
	}

	:global(.theme-classic) .classic-table-caption__border--top {
		top: -1px;
	}
	:global(.theme-classic) .classic-table-caption__border--bottom {
		bottom: -2px;
	}

	:global(.theme-classic) .classic-table-caption__vertical {
		top: 0;
		width: 3px;
		height: 28px;
		background-image: var(--classic-table-vertical);
		background-repeat: repeat-y;
	}

	:global(.theme-classic) .classic-table-caption__vertical--left {
		left: -1px;
	}
	:global(.theme-classic) .classic-table-caption__vertical--right {
		right: -1px;
	}

	:global(.theme-classic) .classic-table-caption__text {
		position: relative;
		z-index: 3;
		height: 16px;
		margin-left: 4px;
		padding: 0 3px 0 10px;
		color: white;
		font-size: 10pt;
		font-weight: 700;
		line-height: 16px;
		transform: translateY(6px);
	}

	:global(.theme-classic) .classic-table-frame__rail {
		box-sizing: border-box;
		position: relative;
		z-index: 1;
		width: 100%;
		min-height: var(--classic-table-rail-min-height);
		border: 2px solid rgb(85 99 108);
		background: var(--classic-table-rail-background, rgb(241 224 197));
	}
</style>
