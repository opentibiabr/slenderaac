<script lang="ts">
	import type { StaticPage } from '@prisma/client';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { faGripLines } from '@fortawesome/free-solid-svg-icons';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { flip } from 'svelte/animate';
	import {
		dndzone,
		SHADOW_PLACEHOLDER_ITEM_ID,
		SOURCES,
		TRIGGERS,
	} from 'svelte-dnd-action';
	import Fa from 'svelte-fa';

	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$lib/enchance';

	import type { PageData } from './$types';

	const modalStore = getModalStore();

	export let data: PageData;

	type StaticPageListItem = {
		id: string;
		slug: string;
		title: string;
	};

	$: staticPages = data.staticPages as StaticPageListItem[];

	async function awaitConfirmation(): Promise<boolean> {
		return new Promise((resolve) => {
			modalStore.trigger({
				type: 'confirm',
				title: 'Delete?',
				body: 'Are you sure you wish to proceed?',
				response: (r: boolean) => resolve(r),
			});
		});
	}

	const submitDeletion: SubmitFunction = async ({ cancel }) => {
		if (!(await awaitConfirmation())) {
			cancel();
		}
	};

	const flipDurationMs = 300;
	let dragDisabled = true;
	let form: HTMLFormElement;

	function handleDndConsider(e: CustomEvent<DndEvent<StaticPageListItem>>) {
		const {
			items: newItems,
			info: { source, trigger },
		} = e.detail;

		staticPages = newItems;
		if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) {
			dragDisabled = true;
		}
	}
	function handleDndFinalize(e: CustomEvent<DndEvent<StaticPageListItem>>) {
		const {
			items: newItems,
			info: { source, trigger },
		} = e.detail;

		staticPages = newItems;
		if (source === SOURCES.POINTER) {
			dragDisabled = true;
		}
		if (trigger === TRIGGERS.DROPPED_INTO_ZONE) {
			form.requestSubmit();
		}
	}
	// eslint-disable-next-line no-undef
	function startDrag(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		dragDisabled = false;
	}
	function handleKeyDown(e: KeyboardEvent) {
		if ((e.key === 'Enter' || e.key === ' ') && dragDisabled)
			dragDisabled = false;
	}
</script>

<form
	method="post"
	hidden
	action="/admin/static-pages?/reorder"
	bind:this={form}
	data-enhance-noreset
	use:enhance>
	{#each staticPages.filter(({ id }) => id !== SHADOW_PLACEHOLDER_ITEM_ID) as staticPage (staticPage.id)}
		<input hidden name="staticPages" value={staticPage.id} />
	{/each}
</form>

<h1 class="h1">Static Pages</h1>
<Button href="/admin/static-pages/new">Create</Button>

<div class="table-container">
	<table class="table table-hover">
		<thead>
			<tr>
				<th class="w-12" />
				<th>Title</th>
				<th class="w-48">Slug</th>
				<th class="w-32">Actions</th>
			</tr>
		</thead>
		<tbody
			use:dndzone={{
				items: staticPages,
				flipDurationMs,
				dragDisabled,
			}}
			on:consider={handleDndConsider}
			on:finalize={handleDndFinalize}>
			{#each staticPages as staticPage (staticPage.id)}
				<tr
					class="[&>td]:!align-middle"
					animate:flip={{ duration: flipDurationMs }}>
					<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
					<td
						tabindex={dragDisabled ? 0 : -1}
						aria-label="drag-handle"
						style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
						on:mousedown={startDrag}
						on:touchstart={startDrag}
						on:keydown={handleKeyDown}>
						<span class="flex justify-center">
							<Fa icon={faGripLines} />
						</span>
					</td>
					<td>{staticPage.title}</td>
					<td>/pages/{staticPage.slug}</td>
					<td>
						<div class="flex flex-row items-center gap-2">
							<Button href="/admin/static-pages/{staticPage.id}" size="sm"
								>Edit</Button>
							<form
								action="/admin/static-pages/{staticPage.id}"
								method="post"
								use:enhance={submitDeletion}>
								<input type="hidden" name="_method" value="DELETE" />
								<Button type="submit" size="sm" color="error">Delete</Button>
							</form>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
