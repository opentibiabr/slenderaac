<script lang="ts">
	import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
	import { cubicInOut } from 'svelte/easing';
	import { fly, slide } from 'svelte/transition';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import OnlineIndicator from '$lib/components/ui/OnlineIndicator.svelte';
	import { debounce } from '$lib/utils';

	import type { PageData } from './$types';

	export let data: PageData;

	let searchInput = $page.url.searchParams.get('search') || '';

	$: {
		if (browser) {
			($page.url.searchParams.get('search') ?? '') !== searchInput &&
				onSearchInput();
		}
	}

	const onSearchInput = debounce(() => {
		const url = new URL($page.url);
		if (searchInput === '') {
			url.searchParams.delete('search');
		} else {
			url.searchParams.set('search', searchInput);
		}
		void goto(`${url.pathname}${url.search}${url.hash}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true,
		});
	}, 200);

	$: results = data.results ?? [];
</script>

<div class="flex flex-col items-center gap-2">
	<label class="label flex flex-row gap-2 items-center">
		<span>{$_('guilds.guild-name')}:</span>

		<input
			class="input flex-1"
			type="search"
			name="search"
			bind:value={searchInput}
			placeholder="{$_('search')}..." />
	</label>

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
								{$_('guilds.members')} (<OnlineIndicator online />)
							</span>
						</th>
					</tr>
				</thead>
				<tbody class="transition-all duration-300 ease-in-out">
					{#each results as guild}
						<a
							href="/guilds/{guild.name}"
							class="table-row [&>td]:!align-middle cursor-pointer"
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
								<span class="font-extrabold">
									{guild.name}
								</span>
								<pre
									class="font-sans font-light whitespace-pre-wrap">{guild.description ??
										''}</pre>
							</td>
							<td class=" w-fit">
								<div class="flex flex-col w-fit">
									<span class="font-semibold flex flex-row gap-1 items-center">
										<OnlineIndicator online={guild.leader.online} />
										<a href="/characters/{guild.leader.name}" class="anchor">
											{guild.leader.name}
										</a>
									</span>
								</div>
							</td>
							<td>
								<span class="flex flex-row items-center gap-0">
									{guild.members} (<OnlineIndicator
										online />&nbsp;{guild.onlineMembers})
								</span>
							</td>
						</a>
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
