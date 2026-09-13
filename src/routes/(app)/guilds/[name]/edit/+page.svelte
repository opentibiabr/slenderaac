<script lang="ts">
	import { faPlusCircle, faSave } from '@fortawesome/free-solid-svg-icons';
	import { Tab, TabGroup } from '@skeletonlabs/skeleton';
	import { _ } from 'svelte-i18n';

	import { applyAction, enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	import GuildMemberEditing from '$lib/components/guilds/GuildMemberEditing.svelte';
	import GuildRankEditing from '$lib/components/guilds/GuildRankEditing.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TextArea from '$lib/components/ui/forms/TextArea.svelte';
	import StatelessModal from '$lib/components/ui/StatelessModal.svelte';
	import { hotkeys } from '$lib/hotkeys';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: guild = data.guild;
	$: guildName = guild?.name ?? '';
	$: errors = form?.errors ?? {};

	function close() {
		guild &&
			void goto(
				themePreviewHref(
					$page.url,
					`/guilds/${encodeURIComponent(guild.name)}`,
				),
			);
	}

	let tabSet = 0;

	$: formId =
		tabSet === 0 ? 'info-form' : tabSet === 1 ? 'ranks-form' : 'members-form';

	let infoForm: HTMLFormElement;
	let ranksForm: HTMLFormElement;
	let membersForm: HTMLFormElement;

	function save() {
		const currentForm =
			tabSet === 0 ? infoForm : tabSet === 1 ? ranksForm : membersForm;
		currentForm.requestSubmit();
	}
</script>

{#if guild}
	<StatelessModal
		title={$_('guilds.edit-guild', { values: { name: guild.name } })}
		on:close={close}>
		{#if errors}
			{#each Object.keys(errors) as key}
				{#each errors[key] as error}
					<p class="text-xs text-error-500">{error}</p>
				{/each}
			{/each}
		{/if}
		<span
			data-hotkeys-global
			use:hotkeys={[
				{ key: 's', metaKey: true, fn: save },
				{ key: 's', ctrlKey: true, fn: save },
			]} />

		<TabGroup>
			<Tab bind:group={tabSet} name="tab-info" value={0}>
				{$_('guilds.info')}
			</Tab>
			<Tab bind:group={tabSet} name="tab-ranks" value={1}>
				{$_('guilds.ranks')}
			</Tab>
			<Tab bind:group={tabSet} name="tab-members" value={2}>
				{$_('guilds.members')}
			</Tab>
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					<form
						id="info-form"
						bind:this={infoForm}
						action={themePreviewHref(
							$page.url,
							`/guilds/${encodeURIComponent(guildName)}/edit?/saveDescription`,
						)}
						class="flex flex-col gap-1"
						method="post"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									await invalidateAll();
								}
								return applyAction(result);
							};
						}}>
						<TextArea
							name="description"
							label={$_('guilds.description')}
							value={guild.description ?? ''} />
					</form>
				{:else if tabSet === 1}
					<form
						id="ranks-form"
						bind:this={ranksForm}
						action={themePreviewHref(
							$page.url,
							`/guilds/${encodeURIComponent(guildName)}/edit?/saveRanks`,
						)}
						class="flex flex-col gap-2"
						method="post"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									await invalidateAll();
								}
								return applyAction(result);
							};
						}}>
						<div class="flex flex-row gap-2">
							<h5 class="h5 w-2/5">{$_('guilds.rank-name')}</h5>
							<h5 class="h5 w-1/3">{$_('guilds.rank-level')}</h5>
							<h5 class="h5 w-16">{$_('order')}</h5>
						</div>
						{#each guild.ranks as rank}
							<GuildRankEditing {rank} {guildName} />
						{/each}
						<Button
							formaction={themePreviewHref(
								$page.url,
								`/guilds/${encodeURIComponent(guildName)}/edit?/addRank`,
							)}
							color="success"
							size="sm"
							variant="soft"
							iconBefore={faPlusCircle}>{$_('add')}</Button>
					</form>
				{:else if tabSet === 2}
					<form
						id="members-form"
						bind:this={membersForm}
						action={themePreviewHref(
							$page.url,
							`/guilds/${encodeURIComponent(guildName)}/edit?/saveMembers`,
						)}
						class="flex flex-col gap-2"
						method="post"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									await invalidateAll();
								}
								return applyAction(result);
							};
						}}>
						<div class="flex flex-row gap-2">
							<h5 class="h5 w-2/5">{$_('guilds.rank-name')}</h5>
							<h5 class="h5 w-1/3">{$_('guilds.rank')}</h5>
							<h5 class="h5 w-16">{$_('guilds.nick')}</h5>
						</div>
						{#each guild.memberships as member}
							<GuildMemberEditing {member} ranks={guild.ranks} />
						{/each}
					</form>
				{/if}
			</svelte:fragment>
		</TabGroup>
		<Button size="md" form={formId} iconBefore={faSave}>{$_('save')}</Button>
	</StatelessModal>
{/if}
