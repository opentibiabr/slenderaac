<script lang="ts">
	import { page } from '$app/stores';

	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;
	$: classic = $page.data.selectedTheme === 'classic';
	let broken = false;
</script>

<div class="legal-index" class:classic>
	<p>
		On this page you can review the legal documents concerning {$page.data
			.serverName}.
	</p>
	<ul>
		{#each data.documents as document}<li>
				{#if data.bullet && !broken}<img
						src={data.bullet}
						width="12"
						height="15"
						alt=""
						on:error={() => (broken = true)} />{:else}<span aria-hidden="true"
						>•</span
					>{/if}
				<a href={themePreviewHref($page.url, document.path)}
					>{$page.data.serverName} {document.title}</a>
			</li>{/each}
	</ul>
</div>

<style>
	p {
		margin: 0 0 15px;
	}
	ul {
		margin: 0 0 0 10px;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: center;
		gap: 4px;
		line-height: 1.5;
	}
	img {
		flex: none;
		width: 12px;
		height: 15px;
	}
	.classic {
		font:
			12px Verdana,
			Arial,
			sans-serif;
	}
	.classic li {
		font:
			13.333px/18px Verdana,
			Arial,
			sans-serif;
	}
	.classic img {
		align-self: flex-start;
	}
</style>
