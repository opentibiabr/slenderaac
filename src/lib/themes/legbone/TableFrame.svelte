<section
	class="news-table-frame card overflow-hidden border border-surface-500">
	<header class="variant-filled-secondary px-4 py-2 font-semibold">
		<slot name="caption" />
	</header>
	<div class="p-3"><slot /></div>
</section>

<style>
	.news-table-frame {
		width: 100%;
		min-width: 0;
	}
</style>
