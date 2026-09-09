<script lang="ts">
	import './classic/native.css';

	import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	import { page } from '$app/stores';

	import { classicAsset, type ClassicAssets } from '$lib/themes/classic/theme';
	import { themeSelectionHref } from '$lib/themes/preview';
	import { themeRegistry } from '$lib/themes/registry';
	import { type ThemeId, themeIds } from '$lib/themes/theme-ids';

	export let selectedTheme: ThemeId;
	export let themeAssets: ClassicAssets = {};
	let open = false;
	let trigger: HTMLElement;
	let currentUrl = '';
	$: classic = selectedTheme === 'classic';
	$: buttonBackground = classicAsset(themeAssets, 'smallButtonBackground');
	$: buttonHover = classicAsset(themeAssets, 'smallButtonHover');
	$: paper = classicAsset(themeAssets, 'paperTexture');
	$: if ($page.url.href !== currentUrl) {
		currentUrl = $page.url.href;
		open = false;
	}
</script>

<svelte:window
	on:keydown={(event) => {
		if (open && event.key === 'Escape') {
			open = false;
			trigger.focus();
		}
	}} />

<div class="layout-switcher-row" class:layout-switcher-row--classic={classic}>
	<nav
		class="layout-switcher"
		class:layout-switcher--classic={classic}
		style:--classic-native-button={buttonBackground
			? `url("${buttonBackground}")`
			: 'none'}
		style:--classic-native-button-hover={buttonHover
			? `url("${buttonHover}")`
			: buttonBackground
				? `url("${buttonBackground}")`
				: 'none'}
		style:--layout-menu-paper={paper ? `url("${paper}")` : 'none'}
		aria-label="Layout"
		data-sveltekit-preload-data="off">
		<details bind:open>
			<summary
				bind:this={trigger}
				class="layout-switcher__trigger {classic
					? 'classic-native-button'
					: 'btn btn-sm variant-filled-primary'}"
				class:layout-switcher__trigger--fallback={classic && !buttonBackground}>
				<span>Layout: {themeRegistry[selectedTheme].name}</span>
				<span
					class="layout-switcher__chevron"
					class:layout-switcher__chevron--open={open}
					aria-hidden="true"><Fa icon={faChevronDown} /></span>
			</summary>
			<ul>
				{#each themeIds as id}
					<li>
						<a
							href={themeSelectionHref($page.url, id)}
							aria-current={id === selectedTheme ? 'true' : undefined}
							on:click={() => (open = false)}>{themeRegistry[id].name}</a>
					</li>
				{/each}
			</ul>
		</details>
	</nav>
</div>

<style>
	/* This control must not participate in the calibrated desktop shell geometry. */
	.layout-switcher-row {
		display: contents;
	}
	.layout-switcher {
		position: absolute;
		top: 8px;
		right: 12px;
		z-index: 40;
		width: 164px;
	}
	details {
		position: relative;
	}
	.layout-switcher__trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 100%;
		padding: 0;
		cursor: pointer;
		white-space: nowrap;
		list-style: none;
	}
	.layout-switcher:not(.layout-switcher--classic) .layout-switcher__trigger {
		font-size: 13px;
		height: 34px;
		min-height: 34px;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	.layout-switcher__chevron {
		display: inline-flex;
		font-size: 8px;
	}
	.layout-switcher__chevron--open {
		transform: rotate(180deg);
	}
	ul {
		position: absolute;
		top: calc(100% + 4px);
		left: -1px;
		right: -1px;
		margin: 0;
		padding: 4px;
		list-style: none;
		border: 1px solid rgb(var(--color-tertiary-700));
		border-radius: var(--theme-rounded-base, 8px);
		background: rgb(var(--color-tertiary-900));
		color: rgb(var(--color-tertiary-50));
		font-size: 13px;
		line-height: 20px;
		box-shadow: 0 3px 6px rgb(0 0 0 / 0.35);
	}
	a {
		display: block;
		padding: 6px 10px;
		color: inherit;
		text-decoration: none;
		border-radius: var(--theme-rounded-base, 8px);
	}
	a[aria-current] {
		background: rgb(var(--color-primary-500));
		color: rgb(var(--on-primary));
		font-weight: bold;
	}
	a:hover {
		background: rgb(var(--color-tertiary-700));
	}
	a:focus-visible,
	summary:focus-visible {
		outline: 2px solid #facc15;
		outline-offset: 2px;
	}
	.layout-switcher--classic {
		width: 135px;
	}
	.layout-switcher__trigger--fallback {
		border: 1px solid #c5a25e;
		background-color: #17325c;
	}
	.layout-switcher--classic ul {
		left: 0;
		right: 0;
		border: 1px solid #5f4d41;
		border-radius: 0;
		background: #f2e3c7 var(--layout-menu-paper) repeat;
		color: #5a2800;
		font-family: Verdana, Arial, sans-serif;
		font-size: 12px;
		box-shadow:
			inset 0 0 0 1px #d0b489,
			0 3px 6px rgb(0 0 0 / 0.35);
	}
	.layout-switcher--classic a {
		border-radius: 0;
	}
	.layout-switcher--classic a[aria-current] {
		background: #5f4d41;
		color: #fff;
	}
	.layout-switcher--classic a:hover {
		background: #d4c0a1;
		color: #5a2800;
	}
	@media (max-width: 767px) {
		/* Give touch controls their own row above either theme's mobile header. */
		.layout-switcher-row {
			display: flow-root;
			background: rgb(var(--color-tertiary-900));
		}
		.layout-switcher-row--classic {
			background: #071524;
		}
		.layout-switcher {
			position: relative;
			top: auto;
			right: auto;
			margin: 8px 12px 8px auto;
		}
		.layout-switcher--classic .layout-switcher__trigger {
			height: 34px;
			min-height: 34px;
		}
	}
</style>
