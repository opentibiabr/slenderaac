<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import { getModalStore, SlideToggle } from '@skeletonlabs/skeleton';

	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$lib/enchance';
	import { formatDate } from '$lib/utils';

	import type { PageData } from './$types';

	const modalStore = getModalStore();

	export let data: PageData;

	function updatePublished(id: string, published: boolean) {
		return async () => {
			const formData = new FormData();
			formData.append('_method', 'PUBLISH');
			formData.append('published', published ? 'on' : '');
			const res = await fetch(`/admin/news/${id}`, {
				method: 'POST',
				body: formData,
			});

			if (res.ok) {
				const news = data.news.find((n) => n.id === id);
				if (news) news.published = published;
			} else {
				const news = data.news.find((n) => n.id === id);
				if (news) news.published = !published;
			}
		};
	}

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
</script>

<h1 class="h1">News</h1>
<Button href="/admin/news/new">Create</Button>

<div class="table-container">
	<table class="table table-hover">
		<thead>
			<tr>
				<th>Title</th>
				<th class="w-48">Author</th>
				<th class="w-48">Date</th>
				<th class="w-16">Published?</th>
				<th class="w-32">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each data.news as news}
				<tr class="[&>td]:!align-middle">
					<td>{news.title}</td>
					<td>{news.author.name}</td>
					<td>{formatDate(news.created_at)}}</td>
					<td
						><SlideToggle
							name="slide"
							bind:checked={news.published}
							on:change={updatePublished(news.id, news.published)} />
					</td>
					<td>
						<div class="flex flex-row items-center gap-2">
							<Button href="/admin/news/{news.id}" size="sm">Edit</Button>
							<form
								action="/admin/news/{news.id}"
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
