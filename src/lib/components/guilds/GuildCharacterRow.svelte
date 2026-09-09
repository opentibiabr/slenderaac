<script lang="ts">
	import {
		faArrowRightFromBracket,
		faCancel,
		faCheck,
		faHandHoldingHand,
		faRemove,
		faWarning,
	} from '@fortawesome/free-solid-svg-icons';
	import { cubicInOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	import { page } from '$app/stores';

	import AnimatedOutfit from '$lib/components/ui/AnimatedOutfit.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import OnlineIndicator from '$lib/components/ui/OnlineIndicator.svelte';
	import { enhance } from '$lib/enchance';
	import { type Player, vocationString } from '$lib/players';
	import { themePreviewHref } from '$lib/themes/preview';

	export let character: Player;
	export let rankLevel: number;
	export let isSelf: boolean;
	export let isOwner: boolean;
	export let guildName: string;
	export let canRemovePlayer = false;

	export let isInvited = false;
	export let canRevokeInvite = false;

	$: leaving = $page.url.searchParams.get('leave') === character.name;
	$: resigning = $page.data.resigning;
</script>

<tr
	class="table-row [&>td]:!align-middle cursor-pointer border-b"
	class:border-primary-300-600-token={rankLevel === 3}
	class:border-secondary-300-600-token={rankLevel === 2}
	class:border-tertiary-300-600-token={rankLevel < 2 && rankLevel > 0}
	transition:fly|local={{
		duration: 300,
		y: -20,
		easing: cubicInOut,
	}}>
	{#if $page.data.selectedTheme !== 'cip-slender'}<td>
			<AnimatedOutfit outfit={character} alt={character.name} />
		</td>{/if}
	<td class=" w-fit">
		<div class="flex flex-col w-fit">
			<span class="font-semibold flex flex-row gap-1 items-center">
				<OnlineIndicator online={character.online} />
				<a
					href={themePreviewHref(
						$page.url,
						`/characters/${encodeURIComponent(character.name)}`,
					)}
					class="anchor">
					{character.name}
				</a>
				{#if character.guild?.nick}
					<em class="font-light">({character.guild.nick})</em>
				{/if}

				{#if isInvited}
					{#if canRevokeInvite}
						<form
							action={themePreviewHref(
								$page.url,
								`/guilds/${encodeURIComponent(guildName)}/invite?/uninvite`,
							)}
							method="post"
							use:enhance>
							<input type="hidden" name="name" value={character.name} />
							<Button
								type="submit"
								size="xs"
								color="secondary"
								class="py-0.5 px-2 font-light">{$_('guilds.uninvite')}</Button>
						</form>
					{/if}
					{#if isSelf}
						<form
							action={themePreviewHref(
								$page.url,
								`/guilds/${encodeURIComponent(guildName)}/join?/accept`,
							)}
							method="post"
							use:enhance>
							<input type="hidden" name="name" value={character.name} />
							<Button
								size="icon"
								class="text-xs h-4 w-4"
								color="success"
								iconBefore={faCheck}
								tooltip={$_('guilds.accept')} />
						</form>
						<form
							action={themePreviewHref(
								$page.url,
								`/guilds/${encodeURIComponent(guildName)}/join?/reject`,
							)}
							method="post"
							use:enhance>
							<input type="hidden" name="name" value={character.name} />
							<Button
								size="icon"
								class="text-xs h-4 w-4"
								color="error"
								iconBefore={faRemove}
								tooltip={$_('guilds.reject')} />
						</form>
					{/if}
				{:else if (canRemovePlayer || isSelf) && !isOwner}
					<form
						action={themePreviewHref(
							$page.url,
							`/guilds/${encodeURIComponent(guildName)}/leave`,
						)}
						method="post"
						use:enhance>
						<input type="hidden" name="name" value={character.name} />
						<Button
							{...leaving
								? { type: 'submit' }
								: { href: `?leave=${encodeURIComponent(character.name)}` }}
							noscroll
							size="xs"
							color="secondary"
							iconAfter={leaving ? faWarning : faArrowRightFromBracket}
							class="py-0.5 px-2 font-light">
							{#if leaving}
								{$_('guilds.confirm')}
							{:else}
								{isSelf ? $_('guilds.leave') : $_('guilds.remove')}
							{/if}
						</Button>
						{#if leaving}
							<Button
								href={themePreviewHref(
									$page.url,
									`/guilds/${encodeURIComponent(guildName)}`,
								)}
								noscroll
								size="xs"
								color="primary"
								variant="soft"
								iconAfter={faCancel}
								class="py-0.5 px-2 font-light">
								{$_('guilds.cancel-leave')}
							</Button>
						{/if}
					</form>
				{/if}
				{#if resigning && !isOwner && !isInvited}
					<form
						action={themePreviewHref(
							$page.url,
							`/guilds/${encodeURIComponent(guildName)}/resign`,
						)}
						method="post"
						use:enhance>
						<input type="hidden" name="newOwner" value={character.name} />
						<Button
							noscroll
							size="xs"
							color="primary"
							iconAfter={faHandHoldingHand}
							class="py-0.5 px-2 font-light">
							{$_('guilds.assing-new-owner')}
						</Button>
					</form>
				{/if}
			</span>
		</div>
	</td>
	<td>{vocationString(character.vocation)}</td>
	<td>{character.level}</td>
</tr>
