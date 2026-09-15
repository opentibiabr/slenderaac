<script lang="ts">
	import { RadioItem } from '@skeletonlabs/skeleton';

	export let group: string | number;
	export let name: string;
	export let value: string | number;
</script>

<RadioItem bind:group {name} {value}><slot /></RadioItem>
