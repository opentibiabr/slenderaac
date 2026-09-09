import { error, redirect } from '@sveltejs/kit';

import { feedbackOpen, feedbackQuestions } from '$lib/feedback';
import { submitFeedback } from '$lib/server/feedback';
import { prisma } from '$lib/server/prisma';
import { requireLogin } from '$lib/server/session';
import { serverName } from '$lib/server/worlds';
import { themePreviewHref } from '$lib/themes/preview';

import type { Actions, PageServerLoad } from './$types';

function loginHref(url: URL) {
	const query = new URLSearchParams({ returnTo: url.pathname + url.search });
	return themePreviewHref(url, `/account/login?${query.toString()}`);
}

export const load = (async ({ url, locals }) => {
	const id = url.searchParams.get('form');
	const now = new Date();
	const world = await serverName();
	if (id !== null) {
		const form = await prisma.feedbackForm.findUnique({ where: { id } });
		if (!form || !form.published || form.starts_at > now)
			throw error(404, 'Feedback form not found');
		requireLogin(locals, '', loginHref(url));
		const response = await prisma.feedbackResponse.findUnique({
			where: {
				form_id_account_id: {
					form_id: id,
					account_id: locals.session.accountId,
				},
			},
			select: { id: true },
		});
		return {
			title: 'Feedback Form',
			world,
			forms: [],
			feedback: {
				id: form.id,
				title: form.title,
				description: form.description,
				questions: feedbackQuestions(form.questions),
				ends_at: form.ends_at,
				version: form.updated_at.toISOString(),
			},
			open: feedbackOpen(form, now),
			submitted: !!response,
		};
	}
	const forms = await prisma.feedbackForm.findMany({
		where: {
			published: true,
			starts_at: { lte: now },
			OR: [{ ends_at: null }, { ends_at: { gt: now } }],
		},
		select: { id: true, title: true, ends_at: true },
		orderBy: [{ starts_at: 'desc' }, { id: 'asc' }],
	});
	return {
		title: 'Feedback Form',
		world,
		forms,
		feedback: null,
		open: false,
		submitted: false,
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, url, locals }) => {
		requireLogin(locals, '', loginHref(url));
		const id = url.searchParams.get('form');
		if (!id) throw error(404, 'Feedback form not found');
		const result = await submitFeedback(
			id,
			locals.session.accountId,
			await request.formData(),
		);
		if (!('submitted' in result)) return result;
		throw redirect(
			303,
			themePreviewHref(
				url,
				`/community/feedback?${new URLSearchParams({ form: id }).toString()}`,
			),
		);
	},
} satisfies Actions;
