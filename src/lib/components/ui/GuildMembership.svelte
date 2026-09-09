<script lang="ts">
	import { _ } from 'svelte-i18n';

	import type { GuildMembership } from '$lib/guilds';

	export let guild: GuildMembership;
	export let href = (name: string) => `/guilds/${encodeURIComponent(name)}`;
	$: parts = $_(
		guild.nick
			? 'guilds.membership-description-with-nick'
			: 'guilds.membership-description',
		{
			values: {
				rank: '\uFFFCrank\uFFFC',
				name: '\uFFFCname\uFFFC',
				nick: '\uFFFCnick\uFFFC',
			},
		},
	).split(/\uFFFC(rank|name|nick)\uFFFC/);
</script>

{#each parts as part, index}
	{#if index % 2 === 0}{part}{:else if part === 'name'}<a
			class="anchor"
			href={href(guild.name)}>{guild.name}</a
		>{:else if part === 'rank'}{guild.rank}{:else}{guild.nick}{/if}
{/each}
