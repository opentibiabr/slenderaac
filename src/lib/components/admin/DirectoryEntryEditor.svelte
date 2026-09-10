<script lang="ts">
	import type { DirectoryEntry } from '@prisma/client';

	import Button from '$lib/components/ui/Button.svelte';
	import {
		directoryContent,
		directoryDetails,
		directoryLanguages,
		directorySocials,
	} from '$lib/directories';
	import { enhance } from '$lib/enchance';

	export let entry: DirectoryEntry | null = null;
	export let values: Record<string, string> | null = null;
	export let errors: Record<string, string[]> | null = null;
	export let action: string | undefined = undefined;
	$: details = directoryDetails(entry?.details ?? {});
	$: kind = values?.kind ?? entry?.kind ?? 'fansite';
	function detailValue(
		key:
			| 'contactCharacter'
			| 'email'
			| 'address'
			| 'telephone'
			| 'mobile'
			| 'contact'
			| 'logoAsset'
			| 'itemAsset',
	) {
		return values?.[key] ?? details[key];
	}
	function selected(key: 'languages' | 'content' | 'socials', value: string) {
		return (values?.[key]?.split(',') ?? details[key]).includes(value);
	}
	const groups = [
		{
			key: 'languages' as const,
			label: 'Languages',
			items: directoryLanguages,
		},
		{ key: 'content' as const, label: 'Content', items: directoryContent },
		{ key: 'socials' as const, label: 'Social Media', items: directorySocials },
	];
	const contactFields = [
		{ key: 'email' as const, label: 'E-Mail Address', limit: 254 },
		{ key: 'address' as const, label: 'Address', limit: 1000 },
		{ key: 'telephone' as const, label: 'Telephone Number', limit: 255 },
		{ key: 'mobile' as const, label: 'Mobile Phone Number', limit: 255 },
		{ key: 'contact' as const, label: 'Contact', limit: 2000 },
	];
</script>

<form
	method="POST"
	{action}
	use:enhance
	data-enhance-noreset
	class="flex flex-col gap-4 max-w-3xl">
	{#if entry}<input
			type="hidden"
			name="version"
			value={entry.updated_at.toISOString()} />{/if}
	{#if errors?.global}<p role="alert" class="text-error-500">
			{errors.global.join(' ')}
		</p>{/if}
	<label class="label"
		><span>Directory</span><select class="select" name="kind" bind:value={kind}
			><option value="fansite">Fansites</option><option value="reseller"
				>Resellers</option
			></select
		></label>
	<label class="label"
		><span>Name</span><input
			name="name"
			class="input"
			required
			maxlength="255"
			value={values?.name ?? entry?.name ?? ''} /></label>
	<label class="label"
		><span>Website</span><input
			type="url"
			name="url"
			class="input"
			required
			maxlength="2048"
			value={values?.url ?? entry?.url ?? ''} /></label>
	<label class="label"
		><span
			>{kind === 'fansite' ? 'Specials (one per line)' : 'Description'}</span
		><textarea
			name="description"
			class="textarea"
			rows="4"
			maxlength="8000"
			value={values?.description ?? entry?.description ?? ''}></textarea
		></label>
	{#if kind === 'fansite'}
		{#each groups as group}<fieldset class="border rounded p-3">
				<legend>{group.label}</legend>
				<div class="grid grid-cols-2 gap-2">
					{#each Object.entries(group.items) as [value, label]}<label
							class="flex gap-2 items-center"
							><input
								type="checkbox"
								class="checkbox"
								name={group.key}
								{value}
								checked={selected(group.key, value)} />{label}</label
						>{/each}
				</div>
			</fieldset>{/each}
		<label class="label"
			><span>Contact character on this server</span><input
				name="contactCharacter"
				class="input"
				maxlength="255"
				value={detailValue('contactCharacter')} /></label>
		<label class="label"
			><span>Logo asset key</span><input
				name="logoAsset"
				class="input"
				maxlength="100"
				value={detailValue('logoAsset')} /><small
				>Optional image from the external theme pack. The logo keeps its
				proportions in a 150 × 100 slot.</small
			></label>
		<label class="label"
			><span>Item asset key</span><input
				name="itemAsset"
				class="input"
				maxlength="100"
				value={detailValue('itemAsset')} /><small
				>Optional 32 × 32 item image from the external theme pack.</small
			></label>
		<label class="flex gap-2 items-center"
			><input
				name="promoted"
				class="checkbox"
				type="checkbox"
				checked={values && 'promoted' in values
					? values.promoted === 'on'
					: (entry?.promoted ?? false)} />Promoted fansite</label>
		<label class="flex gap-2 items-center"
			><input
				name="featured"
				class="checkbox"
				type="checkbox"
				checked={values && 'featured' in values
					? values.featured === 'on'
					: (entry?.featured ?? false)} />Feature in the sidebar</label>
	{:else}
		<label class="label"
			><span>Country codes (comma separated)</span><input
				name="countries"
				class="input"
				required
				maxlength="1000"
				placeholder="BR, US, PT"
				value={values?.countries ?? details.countries.join(', ')} /></label>
		{#each contactFields as field}<label class="label"
				><span>{field.label}</span><input
					name={field.key}
					class="input"
					maxlength={field.limit}
					value={detailValue(field.key)} /></label
			>{/each}
	{/if}
	<label class="flex gap-2 items-center"
		><input
			name="published"
			class="checkbox"
			type="checkbox"
			checked={values && 'published' in values
				? values.published === 'on'
				: (entry?.published ?? false)} />Published</label>
	<div class="flex gap-2">
		<Button type="submit">Save entry</Button><Button href="/admin/directories"
			>Back</Button>
	</div>
</form>
