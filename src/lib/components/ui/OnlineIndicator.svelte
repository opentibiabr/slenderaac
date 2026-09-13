<script lang="ts">
	import { faCircle } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';
	import { tooltip } from 'svooltip';

	import { playerOnline } from '$lib/online-status';
	import { serverAvailability } from '$lib/stores/online-status';

	export let online = false;
	$: available = playerOnline(online, $serverAvailability);
	$: label = $_(
		available === null
			? 'server-status-unknown'
			: available
				? 'online'
				: 'offline',
	);
</script>

<span
	role="img"
	aria-label={label}
	class:text-success-600={available === true}
	class:text-error-600={available === false}
	class:text-surface-500={available === null}
	use:tooltip={{ content: label }}>
	<Fa icon={faCircle} size="xs" />
</span>
