import { Prisma } from '@prisma/client';
import { error, fail } from '@sveltejs/kit';

import {
	feedbackAnswers,
	feedbackOpen,
	feedbackQuestions,
} from '$lib/feedback';
import { prisma } from '$lib/server/prisma';

export const feedbackFailure = (
	status: number,
	errors: Record<string, string[]>,
	values: Record<string, string> = {},
) => fail(status, { errors, values });

export async function submitFeedback(
	formId: string,
	accountId: number,
	input: FormData,
) {
	try {
		return await prisma.$transaction(
			async (tx) => {
				const form = await tx.feedbackForm.findUnique({
					where: { id: formId },
				});
				if (!form || !form.published)
					throw error(404, 'Feedback form not found');
				if (input.get('form_version') !== form.updated_at.toISOString())
					return feedbackFailure(409, {
						global: [
							'This feedback form has changed. Reload it before answering.',
						],
					});
				const answers = feedbackAnswers(
					input,
					feedbackQuestions(form.questions),
				);
				if (!feedbackOpen(form))
					return feedbackFailure(
						409,
						{ global: ['This feedback form is closed.'] },
						answers.values,
					);
				if (!answers.valid)
					return feedbackFailure(400, answers.errors, answers.values);
				await tx.feedbackResponse.create({
					data: {
						form_id: formId,
						account_id: accountId,
						answers: answers.values,
					},
				});
				return { submitted: true };
			},
			{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
		);
	} catch (cause) {
		if (cause instanceof Prisma.PrismaClientKnownRequestError) {
			if (cause.code === 'P2002')
				return feedbackFailure(409, {
					global: ['Your feedback has already been received.'],
				});
			if (cause.code === 'P2034')
				return feedbackFailure(409, {
					global: ['The form changed while submitting. Please try again.'],
				});
			if (cause.code === 'P2003')
				return feedbackFailure(403, {
					global: ['The account is no longer available. Please sign in again.'],
				});
		}
		throw cause;
	}
}
