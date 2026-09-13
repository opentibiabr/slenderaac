import { error, redirect } from '@sveltejs/kit';

import { communityFormOpen } from '$lib/community-forms';
import { communityLoginHref } from '$lib/server/community-forms';
import { loadPollResults, submitVote } from '$lib/server/polls';
import { prisma } from '$lib/server/prisma';
import { requireLogin } from '$lib/server/session';
import { themePreviewHref } from '$lib/themes/preview';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
	const id = url.searchParams.get('poll');
	const now = new Date();
	if (id !== null) {
		const poll = await prisma.poll.findUnique({ where: { id } });
		if (!poll || !poll.published || poll.starts_at > now)
			throw error(404, 'Poll not found');
		requireLogin(locals, '', communityLoginHref(url));
		const vote = await prisma.pollVote.findUnique({
			where: {
				poll_id_account_id: {
					poll_id: id,
					account_id: locals.session.accountId,
				},
			},
			select: { option_id: true },
		});
		return {
			title: 'Polls',
			poll: {
				id,
				title: poll.title,
				description: poll.description,
				ends_at: poll.ends_at,
				version: poll.updated_at.toISOString(),
			},
			results: await loadPollResults(id, poll.options),
			open: communityFormOpen(poll, now),
			choice: vote?.option_id ?? null,
			active: [],
			closed: [],
			count: 0,
			currentPage: 1,
		};
	}
	const where = { published: true, ends_at: { lte: now } };
	const count = await prisma.poll.count({ where });
	const raw = Number(url.searchParams.get('page') || 1);
	const currentPage =
		Number.isSafeInteger(raw) && raw > 0
			? Math.min(raw, Math.max(1, Math.ceil(count / 50)))
			: 1;
	const select = { id: true, title: true, ends_at: true } as const;
	const active = await prisma.poll.findMany({
		where: {
			published: true,
			starts_at: { lte: now },
			OR: [{ ends_at: null }, { ends_at: { gt: now } }],
		},
		select,
		orderBy: [{ starts_at: 'desc' }, { id: 'asc' }],
	});
	const closed = await prisma.poll.findMany({
		where,
		select,
		orderBy: [{ ends_at: 'desc' }, { id: 'asc' }],
		skip: (currentPage - 1) * 50,
		take: 50,
	});
	return {
		title: 'Polls',
		poll: null,
		results: null,
		open: false,
		choice: null,
		active,
		closed,
		count,
		currentPage,
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, url, locals }) => {
		requireLogin(locals, '', communityLoginHref(url));
		const id = url.searchParams.get('poll');
		if (!id) throw error(404, 'Poll not found');
		const result = await submitVote(
			id,
			locals.session.accountId,
			await request.formData(),
		);
		if (!('submitted' in result)) return result;
		throw redirect(
			303,
			themePreviewHref(
				url,
				`/community/polls?${new URLSearchParams({ poll: id }).toString()}`,
			),
		);
	},
} satisfies Actions;
