<script lang="ts">
	import { classicAsset } from './theme';

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
			const asset = classicAsset(assets, key);
			return asset ? `--classic-table-shadow-${side}: url("${asset}")` : '';
		}),
	]
		.filter(Boolean)
		.join('; ');
</script>

<div
	class="classic-table-surface"
	class:classic-table-surface--bordered={bordered}
	style={surfaceStyle}>
	<slot />
</div>

<style>
	:global(.theme-classic) .classic-table-surface {
		box-sizing: border-box;
		position: relative;
		font-size: 10pt;
	}

	:global(.theme-classic) .classic-table-surface--bordered {
		border: 1px solid rgb(95 77 65);
		background: rgb(212 192 161);
	}

	:global(.theme-classic) .classic-table-surface::before,
	:global(.theme-classic) .classic-table-surface::after {
		content: '';
		position: absolute;
		display: block;
		pointer-events: none;
		image-rendering: pixelated;
	}

	:global(.theme-classic) .classic-table-surface::before {
		top: 0;
		right: -4px;
		width: 4px;
		height: 100%;
		background:
			var(--classic-table-shadow-rt, none) 0 0 / 4px 5px no-repeat,
			var(--classic-table-shadow-rm, none) 0 5px / 4px 1px repeat-y;
	}

	:global(.theme-classic) .classic-table-surface::after {
		bottom: -5px;
		left: 0;
		width: calc(100% + 4px);
		height: 5px;
		background:
			var(--classic-table-shadow-bl, none) 0 0 / 4px 5px no-repeat,
			var(--classic-table-shadow-br, none) right 0 / 4px 5px no-repeat,
			var(--classic-table-shadow-bm, none) 4px 0 / 1px 5px repeat-x;
	}

	:global(.theme-classic) .classic-table-surface--bordered::before {
		top: -1px;
		right: -5px;
		height: calc(100% + 2px);
	}

	:global(.theme-classic) .classic-table-surface--bordered::after {
		bottom: -6px;
		left: -1px;
		width: calc(100% + 6px);
	}
</style>
