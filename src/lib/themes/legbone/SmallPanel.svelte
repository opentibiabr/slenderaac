<script lang="ts">
	export let dense = false;
</script>

<div class="card p-3" class:card--dense={dense}><slot /></div>

<style>
	.card--dense {
		padding: 0.5rem;
	}
</style>
