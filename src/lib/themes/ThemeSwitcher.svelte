<script lang="ts">
	import { page } from '$app/stores';

	import { themeSelectionHref } from '$lib/themes/preview';
	import { themeRegistry } from '$lib/themes/registry';
	import { type ThemeId, themeIds } from '$lib/themes/theme-ids';

	export let selectedTheme: ThemeId;
	let open = false;
	let trigger: HTMLElement;
	let currentUrl = '';
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

<div class="layout-switcher-row">
	<nav
		class="layout-switcher"
		aria-label="Layout"
		data-sveltekit-preload-data="off">
		<details bind:open>
			<summary bind:this={trigger}
				>Layout: {themeRegistry[selectedTheme].name}</summary>
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
		color: #f8fafc;
		font:
			13px/20px Arial,
			sans-serif;
	}
	details {
		position: relative;
		border: 1px solid #64748b;
		border-radius: 4px;
		background: #132033;
	}
	summary {
		padding: 6px 10px;
		cursor: pointer;
		white-space: nowrap;
	}
	ul {
		position: absolute;
		top: calc(100% + 4px);
		left: -1px;
		right: -1px;
		margin: 0;
		padding: 4px;
		list-style: none;
		border: 1px solid #64748b;
		border-radius: 4px;
		background: #132033;
	}
	a {
		display: block;
		padding: 6px 10px;
		color: inherit;
		text-decoration: none;
		border-radius: 2px;
	}
	a[aria-current] {
		background: #334155;
		font-weight: bold;
	}
	a:hover {
		background: #475569;
	}
	a:focus-visible,
	summary:focus-visible {
		outline: 2px solid #facc15;
		outline-offset: 2px;
	}
	@media (max-width: 767px) {
		/* Give touch controls their own row above either theme's mobile header. */
		.layout-switcher-row {
			display: flow-root;
			background: #071524;
		}
		.layout-switcher {
			position: relative;
			top: auto;
			right: auto;
			margin: 8px 12px 8px auto;
		}
	}
</style>
