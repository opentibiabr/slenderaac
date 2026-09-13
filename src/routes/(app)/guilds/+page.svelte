<script lang="ts">
	import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
	import { cubicInOut } from 'svelte/easing';
	import { fly, slide } from 'svelte/transition';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import OnlineIndicator from '$lib/components/ui/OnlineIndicator.svelte';
	import SearchQuerier from '$lib/components/ui/SearchQuerier.svelte';
	import { serverAvailability } from '$lib/stores/online-status';
	import ClassicGuildList from '$lib/themes/classic/GuildList.svelte';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;

	$: results = data.results ?? [];
</script>

{#if $page.data.selectedTheme === 'classic'}
	<ClassicGuildList {data} />
{:else}
	<div class="flex flex-col items-center gap-2">
		<SearchQuerier label={`${$_('guilds.guild-name')}:`} />

		{#if results.length > 0}
			<div class="table-container" transition:slide>
				<table class="table table-hover table-auto">
					<thead>
						<tr class="[&>th]:!p-2">
							<th class="w-20" />
							<th>{$_('name')}</th>
							<th>{$_('guilds.leader')}</th>
							<th class="w-32">
								<span class="flex flex-row gap-0 items-center">
									{$_('guilds.members')} ({$_('online')})
								</span>
							</th>
						</tr>
					</thead>
					<tbody class="transition-all duration-300 ease-in-out">
						{#each results as guild}
							<tr
								class="[&>td]:!align-middle"
								transition:fly|local={{
									duration: 300,
									y: -20,
									easing: cubicInOut,
								}}>
								<td>
									<span class="flex flex-row items-center justify-center">
										<Fa icon={faShieldHalved} size="24" />
									</span>
								</td>
								<td>
									<a
										href={themePreviewHref(
											$page.url,
											`/guilds/${encodeURIComponent(guild.name)}`,
										)}
										class="font-extrabold">
										{guild.name}
									</a>
									<pre
										class="font-sans font-light whitespace-pre-wrap">{guild.description ??
											''}</pre>
								</td>
								<td class=" w-fit">
									<div class="flex flex-col w-fit">
										<span
											class="font-semibold flex flex-row gap-1 items-center">
											<OnlineIndicator online={guild.leader.online} />
											<a
												href={themePreviewHref(
													$page.url,
													`/characters/${encodeURIComponent(guild.leader.name)}`,
												)}
												class="anchor">
												{guild.leader.name}
											</a>
										</span>
									</div>
								</td>
								<td>
									<span class="flex flex-row items-center gap-0">
										{guild.members} ({$serverAvailability === null
											? $_('server-status-unknown')
											: $serverAvailability
												? guild.onlineMembers
												: $_('offline')})
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		<div class="flex flex-col items-center gap-2">
			<p>{$_('guilds.cant-find')}</p>
			{#if data.isLoggedIn}
				<Button href="/guilds/new">
					{$_('guilds.create-new')}
				</Button>
			{:else}
				<a href="/account/login?returnTo=/guilds/new" class="anchor">
					{$_('guilds.login')}
				</a>
			{/if}
		</div>
	</div>
{/if}
