<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import type { InformationGallery } from '$lib/information-content';

	export let gallery: InformationGallery;
	let dialog: HTMLDialogElement;
	$: selected = gallery.items.find(
		(item) =>
			String(item.id) === $page.url.searchParams.get('currentscreenshot'),
	);
	$: if (browser && dialog) {
		if (selected && !dialog.open) dialog.showModal();
		else if (!selected && dialog.open) dialog.close();
	}
	function href(id?: number) {
		const url = new URL($page.url);
		if (id) url.searchParams.set('currentscreenshot', String(id));
		else url.searchParams.delete('currentscreenshot');
		return `${url.pathname}${url.search}${url.hash}`;
	}
	function show(id?: number) {
		void goto(href(id), { noScroll: true, keepFocus: true });
	}
	function step(delta: number) {
		if (selected)
			show(
				((selected.id - 1 + delta + gallery.items.length) %
					gallery.items.length) +
					1,
			);
	}
	function keydown(event: KeyboardEvent) {
		if (!selected) return;
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			step(-1);
		}
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			step(1);
		}
	}
</script>

<div
	class="screenshot-gallery"
	style={`--gallery-background: url("${gallery.background}")`}>
	<div class="screenshot-gallery__cell">
		<!-- Keep adjacent inline cards free of extra inter-element spaces. -->
		<!-- prettier-ignore -->
		{#each gallery.items as item}<a class="screenshot-gallery__card" href={href(item.id)} on:click|preventDefault={() => show(item.id)} aria-label={`Open screenshot ${item.id}: ${item.caption}`}><img src={item.thumbnail} alt="" width="230" height="147" /><span class="screenshot-gallery__caption"><span>{item.caption}</span></span></a>{/each}
	</div>
</div>

<dialog
	class="screenshot-dialog"
	bind:this={dialog}
	aria-label="Screenshot gallery"
	on:cancel|preventDefault={() => show()}
	on:keydown={keydown}>
	{#if selected}
		{#each [0, 1] as row}
			{#if row === 1}
				<div class="screenshot-dialog__picture">
					<button
						class="screenshot-dialog__cross"
						aria-label="Close enlarged screenshot"
						on:click={() => show()}>X</button>
					<div class="screenshot-dialog__caption">{selected.caption}</div>
					<img src={selected.src} alt={selected.caption} />
					<div class="screenshot-dialog__caption">{selected.caption}</div>
				</div>
			{/if}
			<div class="screenshot-dialog__navigation">
				<button on:click={() => step(-1)}>« Previous</button>
				<button on:click={() => show()}>Close</button>
				<button on:click={() => step(1)}>Next »</button>
			</div>
		{/each}
	{/if}
</dialog>

<style>
	:global(.theme-cip-slender) .screenshot-gallery {
		display: table;
		width: 100%;
		border-collapse: separate;
		border-spacing: 2px;
	}
	:global(.theme-cip-slender) .screenshot-gallery__cell {
		display: table-cell;
		padding: 1px;
		text-align: center;
		font:
			13.333333px Verdana,
			Arial,
			sans-serif;
	}
	:global(.theme-cip-slender) .screenshot-gallery__card {
		display: inline-block;
		box-sizing: content-box;
		width: 232px;
		margin: 3px;
		padding: 3px;
		border: 1px solid rgb(123 110 76);
		background: var(--gallery-background);
		vertical-align: baseline;
	}
	:global(.theme-cip-slender) .screenshot-gallery__card img {
		display: inline;
		box-sizing: content-box;
		width: 230px;
		height: 147px;
		max-width: none;
		border: 1px solid rgb(123 110 76);
		vertical-align: baseline;
	}
	:global(.theme-cip-slender) .screenshot-gallery__caption {
		display: table;
		border-spacing: 2px;
		width: 230px;
		height: 75px;
		margin: auto;
		color: rgb(201 189 171);
	}
	:global(.theme-cip-slender) .screenshot-gallery__caption > span {
		display: table-cell;
		vertical-align: middle;
		text-align: center;
		font-weight: normal;
	}
	:global(.theme-cip-slender) .screenshot-dialog {
		position: fixed;
		top: 0;
		width: 100%;
		max-width: none;
		max-height: 100vh;
		margin: 0;
		padding: 15px 0 0;
		border: 0;
		background: transparent;
		color: black;
		text-align: center;
		font:
			16px 'Times New Roman',
			serif;
	}
	:global(.theme-cip-slender) .screenshot-dialog::backdrop {
		background: rgb(0 0 0 / 0.75);
	}
	:global(.theme-cip-slender) .screenshot-dialog__navigation {
		display: flex;
		width: 615px;
		max-width: calc(100% - 24px);
		margin: 0 auto 5px;
		font:
			16px Arial,
			sans-serif;
	}
	:global(.theme-cip-slender) .screenshot-dialog__navigation button {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		flex: 1 1 auto;
		box-sizing: content-box;
		height: 25px;
		padding: 2px 0 0;
		border: 1px solid rgb(123 110 76);
		background: rgb(34 53 51);
		color: rgb(242 175 78);
		font: inherit;
	}
	:global(.theme-cip-slender)
		.screenshot-dialog__navigation
		button:nth-child(2) {
		margin: 0 2px;
	}
	:global(.theme-cip-slender) .screenshot-dialog__picture {
		position: relative;
		width: 680px;
		max-width: 100%;
		margin: 0 auto;
	}
	:global(.theme-cip-slender) .screenshot-dialog__caption {
		box-sizing: content-box;
		width: 611px;
		max-width: calc(100% - 24px);
		min-height: 25px;
		margin: 0 auto 5px;
		border: 1px solid rgb(123 110 76);
		background: rgb(34 53 51);
		color: rgb(201 189 171);
		font:
			16px/25px Arial,
			sans-serif;
	}
	:global(.theme-cip-slender) .screenshot-dialog__picture img {
		display: inline;
		box-sizing: content-box;
		max-width: calc(100% - 24px);
		height: auto;
		margin-bottom: 5px;
		border: 1px solid rgb(123 110 76);
		vertical-align: baseline;
	}
	:global(.theme-cip-slender) .screenshot-dialog__cross {
		position: absolute;
		z-index: 1;
		right: -40px;
		top: -33px;
		box-sizing: content-box;
		width: 60px;
		height: 60px;
		padding: 0;
		border: 1px solid gray;
		border-radius: 60px;
		background: rgb(58 68 72);
		color: rgb(255 198 100);
		font:
			25px/60px Arial,
			sans-serif;
	}
	:global(.theme-cip-slender) .screenshot-gallery__card {
		text-decoration: none;
		font-weight: normal;
	}
	@media (max-width: 800px) {
		:global(.theme-cip-slender) .screenshot-dialog__cross {
			display: none;
		}
	}
</style>
