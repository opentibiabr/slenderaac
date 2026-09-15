<script lang="ts">
	export let group: string | number;
	export let name: string;
	export let value: string | number;
</script>

<label class="classic-radio-choice">
	<input type="radio" {name} {value} bind:group />
	<span><slot /></span>
</label>

<style>
	.classic-radio-choice {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 2px 5px;
		font-weight: normal;
		cursor: pointer;
	}
	.classic-radio-choice input {
		appearance: auto;
		width: 13px;
		height: 13px;
		margin: 0;
		accent-color: auto;
	}
</style>
