<script lang="ts">
	import { page } from '$app/stores';

	import DocumentContent from '$lib/components/ui/DocumentContent.svelte';
	import { serverText } from '$lib/site-identity';

	import type { PageData } from './$types';

	export let data: PageData;
	$: identity = { name: $page.data.serverName, website: $page.url.origin };
	const areaHref = (id: string) =>
		`/library/maps?area=${encodeURIComponent(id)}`;
	const fileSize = (bytes: number) => {
		const formatter = new Intl.NumberFormat('en', {
			maximumFractionDigits: 1,
		});
		return bytes < 1024
			? `${bytes} B`
			: bytes < 1024 * 1024
				? `${formatter.format(bytes / 1024)} KB`
				: `${formatter.format(bytes / 1024 / 1024)} MB`;
	};
</script>

<svelte:head><title>{data.title}</title></svelte:head>

<section class="maps-page">
	{#if data.content}<DocumentContent
			content={serverText(data.content, identity)} />
	{:else}<p class="maps-page__intro">
			The world of {identity.name} is separated in continents and islands. Please
			click on a link or on a part of the map below to learn more about the different
			areas.
		</p>{/if}

	{#if data.catalog}
		<ul class="maps-page__regions">
			{#each data.catalog.sections as section}<li>
					<strong>{section.title}:</strong>
					<ul>
						{#each section.groups as group}<li>
								{#if group.label}<strong>{group.label}:</strong>{/if}
								{#each group.places as place, index}{#if index > 0}{index ===
										group.places.length - 1
											? ' and '
											: ', '}{/if}<a
										class:active={data.selected?.id === place.id}
										href={areaHref(place.id)}>{place.name}</a
									>{/each}
							</li>{/each}
					</ul>
				</li>{/each}
		</ul>

		{#if data.selected}<article class="maps-page__detail" id="area">
				<h2>{serverText(data.selected.name, identity)}</h2>
				{#if data.selected.description}<p>
						{serverText(data.selected.description, identity)}
					</p>{/if}
				{#if data.selected.imageHref}<img
						src={data.selected.imageHref}
						alt={`Map of ${serverText(data.selected.name, identity)}`} />{/if}
			</article>{/if}

		{#if data.catalog.overviewHref}<figure class="maps-page__overview">
				<div class="maps-page__canvas">
					<img
						src={data.catalog.overviewHref}
						alt={`${identity.name} world map`} />
					{#each data.catalog.sections as section}{#each section.groups as group}{#each group.places.filter((place) => place.x !== null && place.y !== null) as place}<a
									class="maps-page__hotspot"
									class:active={data.selected?.id === place.id}
									href={areaHref(place.id)}
									style={`left:${place.x}%;top:${place.y}%`}
									title={place.name}
									aria-label={`View ${place.name}`}></a
								>{/each}{/each}{/each}
				</div>
			</figure>
		{:else}<p class="maps-page__state">The overview map is unavailable.</p>{/if}

		{#if data.catalog.highResolution}<p class="maps-page__download">
				[<a href={data.catalog.highResolution.href}
					>Download high resolution map ({fileSize(
						data.catalog.highResolution.size,
					)})</a
				>]
			</p>{/if}
	{:else}<p class="maps-page__state">
			The server map is not configured. Please try again later.
		</p>{/if}
</section>

<style>
	.maps-page__intro,
	.maps-page > :global(.document-content) {
		margin: 0 0 16px;
	}
	.maps-page__regions {
		margin: 0 0 18px;
		padding-left: 22px;
	}
	.maps-page__regions ul {
		padding-left: 24px;
	}
	.maps-page__regions a.active {
		font-weight: 700;
	}
	.maps-page__detail,
	.maps-page__state {
		margin: 16px 0;
		padding: 12px;
		border: 1px solid rgb(var(--color-surface-500));
		background: rgb(var(--color-surface-700) / 0.35);
	}
	.maps-page__detail h2 {
		margin: 0 0 8px;
		font-size: 1.125rem;
		font-weight: 700;
	}
	.maps-page__detail p {
		margin: 0 0 10px;
	}
	.maps-page__detail img {
		display: block;
		max-width: 100%;
		height: auto;
		margin: 0 auto;
	}
	.maps-page__overview {
		margin: 18px auto 0;
	}
	.maps-page__canvas {
		position: relative;
		width: fit-content;
		max-width: 100%;
		margin: 0 auto;
	}
	.maps-page__canvas > img {
		display: block;
		max-width: 100%;
		height: auto;
	}
	.maps-page__hotspot {
		position: absolute;
		width: 18px;
		height: 18px;
		transform: translate(-50%, -50%);
		border: 2px solid #ffe36e;
		border-radius: 50%;
		background: rgb(105 12 7 / 0.65);
		opacity: 0;
	}
	.maps-page__hotspot:hover,
	.maps-page__hotspot:focus-visible,
	.maps-page__hotspot.active {
		opacity: 1;
	}
	.maps-page__download {
		margin: 8px 0 0;
		text-align: center;
	}
	:global(.layout-surface-ornate) .maps-page {
		font:
			12px Verdana,
			Arial,
			sans-serif;
	}
	:global(.layout-surface-ornate) .maps-page__regions {
		margin: 12px 0 18px;
		padding-left: 20px;
	}
	:global(.layout-surface-ornate) .maps-page__regions > li + li {
		margin-top: 12px;
	}
	:global(.layout-surface-ornate) .maps-page__regions ul {
		margin: 0;
		padding-left: 8px;
	}
	:global(.layout-surface-ornate) .maps-page__detail,
	:global(.layout-surface-ornate) .maps-page__state {
		border: 1px solid #793d03;
		background: #d4c0a1;
	}
</style>
