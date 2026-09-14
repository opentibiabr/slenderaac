<script lang="ts">
	import SmallBox from './SmallBox.svelte';

	export let dense = false;
	export let assets: Record<string, string | undefined> | null | undefined;
</script>

<SmallBox {assets} {dense}><slot /></SmallBox>
