<script lang="ts">
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { serverAvailability } from '$lib/stores/online-status';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from '../../../routes/(app)/guilds/$types';

	export let data: PageData;
	$: parameters = new URL(themePreviewHref($page.url, '/guilds'), $page.url)
		.searchParams;
</script>

<PagePanel title="Search Guild">
	<form method="get" class="classic-filter-grid">
		{#each Array.from(parameters) as [name, value]}<input
				type="hidden"
				{name}
				{value} />{/each}
		<label for="guild-name">Guild Name:</label>
		<input
			id="guild-name"
			name="search"
			value={$page.url.searchParams.get('search') ?? ''} />
		<div class="classic-filter-submit">
			<Button type="submit">Submit</Button>
		</div>
	</form>
</PagePanel>
<PagePanel title="Guilds" surface>
	<table class="classic-data-table">
		<thead
			><tr><th>Guild</th><th>Leader</th><th>Members</th><th>Online</th></tr
			></thead
		><tbody>
			{#each data.results as guild}<tr>
					<td
						><a
							href={themePreviewHref(
								$page.url,
								'/guilds/' + encodeURIComponent(guild.name),
							)}>{guild.name}</a
						>{#if guild.description}<div class="classic-preserve-lines">
								{guild.description}
							</div>{/if}</td>
					<td
						><a
							href={themePreviewHref(
								$page.url,
								'/characters/' + encodeURIComponent(guild.leader.name),
							)}>{guild.leader.name}</a
						></td>
					<td>{guild.members}</td><td
						>{$serverAvailability === null
							? 'Unavailable'
							: $serverAvailability
								? guild.onlineMembers
								: 'Offline'}</td>
				</tr>{:else}<tr><td colspan="4">No guilds found.</td></tr>{/each}
		</tbody>
	</table>
</PagePanel>
<PagePanel title="Create Guild">
	<p>Create and manage a guild using your local account.</p>
	<Button
		href={themePreviewHref(
			$page.url,
			data.isLoggedIn ? '/guilds/new' : '/account/login?returnTo=/guilds/new',
		)}>{data.isLoggedIn ? 'Create Guild' : 'Login'}</Button>
</PagePanel>
