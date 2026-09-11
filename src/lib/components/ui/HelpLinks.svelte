<script lang="ts">
	import { page } from '$app/stores';

	import SmallPanel from '$lib/components/ui/SmallPanel.svelte';
	import { serverText } from '$lib/site-identity';
	import { themePreviewHref } from '$lib/themes/preview';

	export let title: string;
	export let entries: { slug: string; title: string }[];
	$: classic = $page.data.selectedTheme === 'classic';
</script>

<section class="help-links" class:classic>
	<SmallPanel
		><h2>{title}</h2>
		{#if classic}<div
				class="help-separator"
				style:background-image={`url("${$page.data.themeAssets?.contentFrameHorizontal ?? ''}")`}>
			</div>{/if}
		{#if entries.length}<ul>
				{#each entries as entry}<li>
						<a
							href={themePreviewHref(
								$page.url,
								`/support/get-help?article=${entry.slug}`,
							)}
							>{serverText(entry.title, {
								name: $page.data.serverName,
								website: '',
							})}</a>
					</li>{/each}
			</ul>
		{:else}<p>No articles viewed yet.</p>{/if}
	</SmallPanel>
</section>

<style>
	h2 {
		font-size: 1.25rem;
		font-weight: bold;
		margin: 0 0 0.75rem;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		padding: 5px;
	}
	li:nth-child(odd) {
		background: rgb(0 0 0 / 0.08);
	}
	a {
		display: block;
	}
	.classic h2 {
		font:
			bold 20px Verdana,
			Arial,
			sans-serif;
		margin: 0;
		text-align: center;
	}
	.classic li {
		padding: 2px 5px;
		font:
			14.667px/55px Verdana,
			Arial,
			sans-serif;
		text-align: center;
		background: #d5c0a1;
	}
	.classic li:nth-child(odd) {
		background: #f1e0c6;
	}
	.classic {
		position: relative;
	}
	.classic ul {
		margin: 14.667px -6px 0;
		font-size: 14.667px;
	}
	.classic a {
		display: inline-block;
		line-height: normal;
		vertical-align: middle;
	}
	.help-separator {
		position: absolute;
		top: 52px;
		left: 2px;
		width: calc(100% - 4px);
		height: 4px;
		background-repeat: repeat-x;
		pointer-events: none;
	}
	.classic p {
		margin-top: 25px;
	}
</style>
