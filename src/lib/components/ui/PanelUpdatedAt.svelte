<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';

	export let date: Date;
</script>

<time
	class="panel-updated-at"
	datetime={date.toISOString()}
	title={date.toLocaleString('en-US')}
	>Last Update: {formatDistanceToNow(date, { addSuffix: true })}</time>

<style>
	.panel-updated-at {
		float: right;
		margin-right: 5px;
		font-weight: normal;
	}
	@media (max-width: 767px) {
		.panel-updated-at {
			max-width: calc(100% - 95px);
			font-size: 10px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
</style>
