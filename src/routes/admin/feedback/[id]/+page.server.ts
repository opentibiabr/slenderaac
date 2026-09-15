import { Prisma } from '@prisma/client';
import { error } from '@sveltejs/kit';

import {
	feedbackEditorValues,
	feedbackInput,
	feedbackQuestions,
} from '$lib/feedback';
import { feedbackFailure } from '$lib/server/feedback';
import { prisma } from '$lib/server/prisma';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params, url }) => {
	const feedback = await prisma.feedbackForm.findUnique({
		where: { id: params.id },
		include: { _count: { select: { responses: true } } },
	});
	if (!feedback) throw error(404, 'Feedback form not found');
	const rawPage = Number(url.searchParams.get('page') || 1);
	const pages = Math.max(1, Math.ceil(feedback._count.responses / 25));
	const currentPage =
		Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, pages) : 1;
	const responses = await prisma.feedbackResponse.findMany({
		where: { form_id: params.id },
		orderBy: [{ submitted_at: 'desc' }, { id: 'desc' }],
		skip: (currentPage - 1) * 25,
		take: 25,
		select: { id: true, answers: true, submitted_at: true, account_id: true },
	});
	return {
		feedback,
		responses,
		currentPage,
		pages,
		questions: feedbackQuestions(feedback.questions),
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, params }) => {
		const data = await request.formData();
		const input = feedbackInput(data);
		if (!input)
			return feedbackFailure(
				400,
				{
					global: [
						'Enter a title, valid dates and between one and twenty questions.',
					],
				},
				feedbackEditorValues(data),
			);
		try {
			return await prisma.$transaction(
				async (tx) => {
					const current = await tx.feedbackForm.findUnique({
						where: { id: params.id },
						include: { _count: { select: { responses: true } } },
					});
					if (!current) throw error(404, 'Feedback form not found');
					if (
						current._count.responses &&
						JSON.stringify(feedbackQuestions(current.questions)) !==
							JSON.stringify(input.questions)
					)
						return feedbackFailure(
							409,
							{
								global: [
									'Questions cannot change after the first response. Create a new form for a different questionnaire.',
								],
							},
							feedbackEditorValues(data),
						);
					await tx.feedbackForm.update({
						where: { id: params.id },
						data: input,
					});
					return { saved: true, errors: {} as Record<string, string[]> };
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
			);
		} catch (cause) {
			if (
				cause instanceof Prisma.PrismaClientKnownRequestError &&
				cause.code === 'P2034'
			)
				return feedbackFailure(
					409,
					{
						global: ['This form changed during your update. Please try again.'],
					},
					feedbackEditorValues(data),
				);
			throw cause;
		}
	},
} satisfies Actions;
