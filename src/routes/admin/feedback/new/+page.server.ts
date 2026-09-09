import { redirect } from '@sveltejs/kit';

import { feedbackEditorValues, feedbackInput } from '$lib/feedback';
import { feedbackFailure } from '$lib/server/feedback';
import { prisma } from '$lib/server/prisma';

import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
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
		const feedback = await prisma.feedbackForm.create({ data: input });
		throw redirect(303, `/admin/feedback/${feedback.id}`);
	},
} satisfies Actions;
