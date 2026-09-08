<script lang="ts">
	import { cipAsset } from './theme';

	export let assets: Record<string, string | undefined> | null | undefined;
	export let width: number | string;
	export let bordered = true;

	$: surfaceStyle = [
		`width: ${typeof width === 'number' ? `${width}px` : width}`,
		...(
			[
				['rt', 'newsArchiveTableShadowRightTop'],
				['rm', 'newsArchiveTableShadowRightMiddle'],
				['bm', 'newsArchiveTableShadowBottomMiddle'],
				['bl', 'newsArchiveTableShadowBottomLeft'],
				['br', 'newsArchiveTableShadowBottomRight'],
			] as const
		).map(([side, key]) => {
			const asset = cipAsset(assets, key);
			return asset ? `--cip-table-shadow-${side}: url("${asset}")` : '';
		}),
	]
		.filter(Boolean)
		.join('; ');
</script>

<div
	class="cip-table-surface"
	class:cip-table-surface--bordered={bordered}
	style={surfaceStyle}>
	<slot />
</div>

<style>
	:global(.theme-cip-slender) .cip-table-surface {
		box-sizing: border-box;
		position: relative;
		font-size: 10pt;
	}

	:global(.theme-cip-slender) .cip-table-surface--bordered {
		border: 1px solid rgb(95 77 65);
		background: rgb(212 192 161);
	}

	:global(.theme-cip-slender) .cip-table-surface::before,
	:global(.theme-cip-slender) .cip-table-surface::after {
		content: '';
		position: absolute;
		display: block;
		pointer-events: none;
		image-rendering: pixelated;
	}

	:global(.theme-cip-slender) .cip-table-surface::before {
		top: 0;
		right: -4px;
		width: 4px;
		height: 100%;
		background:
			var(--cip-table-shadow-rt, none) 0 0 / 4px 5px no-repeat,
			var(--cip-table-shadow-rm, none) 0 5px / 4px 1px repeat-y;
	}

	:global(.theme-cip-slender) .cip-table-surface::after {
		bottom: -5px;
		left: 0;
		width: calc(100% + 4px);
		height: 5px;
		background:
			var(--cip-table-shadow-bl, none) 0 0 / 4px 5px no-repeat,
			var(--cip-table-shadow-br, none) right 0 / 4px 5px no-repeat,
			var(--cip-table-shadow-bm, none) 4px 0 / 1px 5px repeat-x;
	}

	:global(.theme-cip-slender) .cip-table-surface--bordered::before {
		top: -1px;
		right: -5px;
		height: calc(100% + 2px);
	}

	:global(.theme-cip-slender) .cip-table-surface--bordered::after {
		bottom: -6px;
		left: -1px;
		width: calc(100% + 6px);
	}
</style>
